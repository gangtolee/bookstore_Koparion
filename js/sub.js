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
            $('#detail-short-desc').html(`<p>${fullDesc}</p>`); 
        }

        renderDetailsTab(book);

        let wishlist = JSON.parse(localStorage.getItem('koparion_wishlist')) || [];
        let isWished = wishlist.some(item => item.isbn === book.isbn);
        
        let $wishIcon = $('.product-actions a i');
        
        if (isWished) {
            $wishIcon.removeClass('fa-regular').addClass('fa-solid').css('color', '#DC3232');
        } else {
            $wishIcon.removeClass('fa-solid').addClass('fa-regular').css('color', '');
        }
    } 

    $(document).on('click', '#btn-top-more', function() {
        let $descText = $(this).siblings('.desc-text');
        let $linkWrapper = $(this).siblings('#ka-link-wrapper');

        $descText.toggleClass('collapsed');
        
        if ($descText.hasClass('collapsed')) {
            $(this).html('더보기 <i class="fa-solid fa-angle-down"></i>');
            $linkWrapper.hide(); 
        } else {
            $(this).html('접기 <i class="fa-solid fa-angle-up"></i>');
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

    // 6. 수량 조절 (+ / -) 기능
    $('.qtybutton').on('click', function() {
        let $input = $('.qty-input');
        let currentVal = parseInt($input.val()) || 1;

        if ($(this).hasClass('inc')) {
            $input.val(currentVal + 1);
        } else if ($(this).hasClass('dec')) {
            if (currentVal > 1) {
                $input.val(currentVal - 1);
            }
        }
    });

    // 7. 장바구니(Cart) 담기 기능 (localStorage 활용)
    $('.btn-add-to-cart').on('click', function() {
        if (!currentBookData) return;

        let qty = parseInt($('.qty-input').val()) || 1;
        let price = currentBookData.sale_price > 0 ? currentBookData.sale_price : currentBookData.price;
        
        let cartItem = {
            isbn: currentBookData.isbn,
            title: currentBookData.title,
            thumbnail: currentBookData.thumbnail,
            price: price,
            quantity: qty
        };

        let cart = JSON.parse(localStorage.getItem('koparion_cart')) || [];

        let existingItemIndex = cart.findIndex(item => item.isbn === cartItem.isbn);

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += qty;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem('koparion_cart', JSON.stringify(cart));

        updateCartCount();

        $('#cart-modal').fadeIn(200); 
    });

    $(document).on('click', '#btn-close-modal', function() {
        $('#cart-modal').fadeOut(200);
    });

    $('.product-actions a').on('click', function(e) {
        e.preventDefault();
        if (!currentBookData) return;

        let wishlist = JSON.parse(localStorage.getItem('koparion_wishlist')) || [];
        
        let existingIndex = wishlist.findIndex(item => item.isbn === currentBookData.isbn);
        
        let $icon = $(this).find('i');

        if (existingIndex !== -1) {
            wishlist.splice(existingIndex, 1);
            $icon.removeClass('fa-solid').addClass('fa-regular').css('color', '');
        } else {
            wishlist.push({
                isbn: currentBookData.isbn,
                title: currentBookData.title,
                thumbnail: currentBookData.thumbnail
            });
            $icon.removeClass('fa-regular').addClass('fa-solid').css('color', '#DC3232');
        }
        
        localStorage.setItem('koparion_wishlist', JSON.stringify(wishlist));
    });

    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('koparion_cart')) || [];
        let totalCount = 0;
        
        cart.forEach(item => {
            totalCount += item.quantity;
        });

        $('.cart-quantity').text(totalCount);
    }

    updateCartCount();
});