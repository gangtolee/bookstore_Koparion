$(document).ready(function() {

    const urlParams = new URLSearchParams(window.location.search);
    const bookTitle = urlParams.get('title');

    let currentBookData = null;

    if (bookTitle) {
        fetchBookData(bookTitle);
    } else {
        alert("상품 정보가 없습니다!");
        window.location.href = "index.html";
    }

    function fetchBookData(title) {
        fetch(`https://dapi.kakao.com/v3/search/book?target=title&query=${title}&size=1`, {
            method: "GET",
            headers: {
                "Authorization": "KakaoAK c9f224b560497c9acc2114158360d425"
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.documents.length > 0) {
                currentBookData = data.documents[0];
                renderBookDetails(currentBookData);
            } else {
                alert("해당 책을 찾을 수 없습니다.");
            }
        })
        .catch(error => {
            console.error("오류 발생:", error);
        });
    }

    function renderBookDetails(book) {
        $('#breadcrumb-title').text(book.title);
        $('#detail-title').text(book.title);

        if (book.thumbnail) {
            let bigImageUrl = book.thumbnail.replace('R120x174.q85', 'R300x0.q100');
            $('#detail-main-img').attr('src', bigImageUrl);
        }

        let price = book.sale_price > 0 ? book.sale_price : book.price;
        $('#detail-price').text('₩' + price.toLocaleString());

        let fullDesc = book.contents || "상세 설명이 제공되지 않습니다.";
        
        // 🌟 수정된 부분 1: 링크 박스에 ID를 달고, 초기 상태를 숨김(display:none)으로 설정 🌟
        let outLinkHtml = book.url ? `
            <div id="ka-link-wrapper" style="margin-top:15px; display:none;">
                <a href="${book.url}" target="_blank" style="color:#f07c29; font-weight:bold; text-decoration:none;">
                    👉 상세 설명 전체 보기 (카카오 도서로 이동)
                </a>
            </div>` : '';
        
        if (fullDesc.length > 100) {
            $('#detail-short-desc').html(`
                <div class="desc-wrapper">
                    <div class="desc-text collapsed">
                        <p>${fullDesc}...</p>
                    </div>
                    <button class="btn-desc-more" id="btn-top-more">더보기 <i class="fa-solid fa-angle-down"></i></button>
                    ${outLinkHtml}
                </div>
            `);
        } else {
            // 글이 짧아서 더보기 버튼이 없을 땐 그냥 다 보여줍니다.
            $('#detail-short-desc').html(`<p>${fullDesc}</p>`); 
        }

        // 하단 탭 초기 렌더링 (DETAILS 테이블 띄우기)
        renderDetailsTab(book);
    } 

    // 🌟 수정된 부분 2: 클릭 시 링크 박스 토글 기능 추가 🌟
    $(document).on('click', '#btn-top-more', function() {
        let $descText = $(this).siblings('.desc-text');
        // 클릭된 버튼과 같은 구역에 있는 링크 박스를 찾습니다.
        let $linkWrapper = $(this).siblings('#ka-link-wrapper');

        $descText.toggleClass('collapsed');
        
        if ($descText.hasClass('collapsed')) {
            // ❌ 이제 접힌 상태입니다 (Show More)
            $(this).html('더보기 <i class="fa-solid fa-angle-down"></i>'); 
            // 🌟 링크 박스도 숨깁니다. 🌟
            $linkWrapper.hide(); 
        } else {
            // ✅ 이제 펼쳐진 상태입니다 (Show Less)
            $(this).html('접기 <i class="fa-solid fa-angle-up"></i>'); 
            // 🌟 링크 박스를 서서히 나타나게 합니다. 🌟
            $linkWrapper.fadeIn(300); 
        }
    });

    // 하단 탭 메뉴 클릭 이벤트
    $('.tab-btn').on('click', function(e) {
        e.preventDefault();
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');

        let target = $(this).data('target');

        if (target === "details") {
            renderDetailsTab(currentBookData);
        
        } else if (target === "author") {
            let authors = currentBookData.authors.join(", ");
            let searchLink = `https://search.daum.net/search?w=book&q=${encodeURIComponent(authors)}`;
            
            $('#detail-tab-content').html(`
                <div class="tab-custom-box">
                    <i class="fa-solid fa-pen-nib"></i>
                    <h4>${authors}</h4>
                    <p>Daum 도서에서 제공하는 이 작가의 다른 멋진 작품들을 확인해 보세요.</p>
                    <a href="${searchLink}" target="_blank" class="btn-tab-link">작가의 다른 도서 검색하기</a>
                </div>
            `);
        
        } else if (target === "reviews") {
            $('#detail-tab-content').html(`
                <div class="tab-custom-box">
                    <i class="fa-regular fa-comments"></i>
                    <h4>이 책을 먼저 읽은 독자들의 생각이 궁금하신가요?</h4>
                    <p>독자들의 생생한 리뷰와 평점은 제휴 페이지에서 바로 확인하실 수 있습니다.</p>
                    <a href="${currentBookData.url}" target="_blank" class="btn-tab-link">리뷰 보러 가기</a>
                </div>
            `);
        }
    });

    // 테이블 그려주는 함수
    function renderDetailsTab(book) {
        let pubDate = book.datetime ? book.datetime.substring(0, 10) : "-";
        let authors = book.authors.join(", ");
        let translators = book.translators.length > 0 ? book.translators.join(", ") : "-";
        
        $('#detail-tab-content').html(`
            <table class="detail-table">
                <tr><th>저자</th><td>${authors}</td></tr>
                <tr><th>번역</th><td>${translators}</td></tr>
                <tr><th>출판사</th><td>${book.publisher}</td></tr>
                <tr><th>출간일</th><td>${pubDate}</td></tr>
                <tr><th>정가</th><td>₩${book.price.toLocaleString()}</td></tr>
                <tr><th>ISBN</th><td>${book.isbn}</td></tr>
            </table>
        `);
    }

    // =========================================================
    // 🌟 아래부터 새로 추가할 기능들입니다! 🌟
    // =========================================================

    // 6. 수량 조절 (+ / -) 기능
    $('.qtybutton').on('click', function() {
        let $input = $('.qty-input');
        let currentVal = parseInt($input.val()) || 1; // 문자를 숫자로 변환

        if ($(this).hasClass('inc')) {
            $input.val(currentVal + 1); // + 클릭 시
        } else if ($(this).hasClass('dec')) {
            if (currentVal > 1) {
                $input.val(currentVal - 1); // - 클릭 시 (1 밑으론 안 내려감)
            }
        }
    });

    // 7. 장바구니(Cart) 담기 기능 (localStorage 활용)
    $('.btn-add-to-cart').on('click', function() {
        if (!currentBookData) return;

        let qty = parseInt($('.qty-input').val()) || 1;
        let price = currentBookData.sale_price > 0 ? currentBookData.sale_price : currentBookData.price;
        
        // 장바구니에 담을 아이템 정보(객체) 만들기
        let cartItem = {
            isbn: currentBookData.isbn,
            title: currentBookData.title,
            thumbnail: currentBookData.thumbnail,
            price: price,
            quantity: qty
        };

        // 브라우저 저장소에서 기존 장바구니 꺼내오기 (없으면 빈 배열 [])
        let cart = JSON.parse(localStorage.getItem('koparion_cart')) || [];

        // 이미 장바구니에 있는 책인지 확인 (ISBN 바코드 번호로 비교)
        let existingItemIndex = cart.findIndex(item => item.isbn === cartItem.isbn);

        if (existingItemIndex !== -1) {
            // 이미 담긴 책이면 수량만 증가!
            cart[existingItemIndex].quantity += qty;
        } else {
            // 처음 담는 책이면 장바구니 목록에 추가!
            cart.push(cartItem);
        }

        // 업데이트된 장바구니를 다시 브라우저 저장소에 문자열로 예쁘게 저장
        localStorage.setItem('koparion_cart', JSON.stringify(cart));

        // 우측 상단 장바구니 빨간 동그라미 숫자 업데이트
        updateCartCount();

        alert(`[${cartItem.title}]이(가) 장바구니에 ${qty}권 담겼습니다! 🛒`);
    });

    // 8. 위시리스트(Wishlist) 담기 기능
    $('.product-actions a').on('click', function(e) {
        e.preventDefault(); // 화면 맨 위로 튕기는 현상 방지
        if (!currentBookData) return;

        // 위시리스트 꺼내오기
        let wishlist = JSON.parse(localStorage.getItem('koparion_wishlist')) || [];
        
        // 이미 찜한 책인지 확인
        let existingItem = wishlist.find(item => item.isbn === currentBookData.isbn);

        if (existingItem) {
            alert("이미 찜하신 상품입니다! ❤️");
        } else {
            // 없으면 추가
            wishlist.push({
                isbn: currentBookData.isbn,
                title: currentBookData.title,
                thumbnail: currentBookData.thumbnail
            });
            localStorage.setItem('koparion_wishlist', JSON.stringify(wishlist));
            alert("위시리스트에 쏙 담겼습니다! ❤️");
        }
    });

    // 9. 헤더의 장바구니 숫자 업데이트 함수
    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('koparion_cart')) || [];
        let totalCount = 0;
        
        // 장바구니에 있는 모든 책의 수량을 더함
        cart.forEach(item => {
            totalCount += item.quantity;
        });

        // 헤더 장바구니 아이콘 옆 숫자(0) 변경
        $('.cart-quantity').text(totalCount);
    }

    // 페이지가 처음 열렸을 때 기존 장바구니 숫자를 불러와서 세팅
    updateCartCount();
});