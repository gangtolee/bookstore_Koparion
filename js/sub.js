$(document).ready(function() {

    // 1. 주소창에서 '?title=책제목' 빼오기
    const urlParams = new URLSearchParams(window.location.search);
    const bookTitle = urlParams.get('title');

    let currentBookData = null;

    if (bookTitle) {
        fetchBookData(bookTitle);
    } else {
        alert("상품 정보가 없습니다!");
        window.location.href = "index.html";
    }

    // 2. 카카오 책 검색 Fetch API
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

    // 3. 화면 렌더링 (더보기 기능 포함)
    function renderBookDetails(book) {
        $('#breadcrumb-title').text(book.title);
        $('#detail-title').text(book.title);

        if (book.thumbnail) {
            let bigImageUrl = book.thumbnail.replace('R120x174.q85', 'R300x0.q100');
            $('#detail-main-img').attr('src', bigImageUrl);
        }

        let price = book.sale_price > 0 ? book.sale_price : book.price;
        $('#detail-price').text('₩' + price.toLocaleString());

        // 🌟 수정된 부분 1: 끊긴 글씨 뒤에 '...'과 카카오 링크 붙이기 🌟
        let fullDesc = book.contents || "상세 설명이 제공되지 않습니다.";
        let outLink = book.url ? `<br><br><a href="${book.url}" target="_blank" style="color:#f07c29; font-weight:bold; text-decoration:none;">👉 상세 설명 전체 보기 (카카오 도서로 이동)</a>` : '';

        if (fullDesc.length > 100) {
            $('#detail-short-desc').html(`
                <div class="desc-wrapper">
                    <div class="desc-text collapsed">
                        <p>${fullDesc}...</p>
                        ${outLink}
                    </div>
                    <button class="btn-desc-more" id="btn-top-more">더보기 <i class="fa-solid fa-angle-down"></i></button>
                </div>
            `);
        } else {
            // 글이 짧으면 그냥 다 보여줌
            $('#detail-short-desc').html(`<p>${fullDesc}</p>`);
        }

        // 하단 탭 초기 렌더링 (DESCRIPTION)
        $('#detail-tab-content').html(`<p>${fullDesc}...</p>${outLink}`);
    }

    // 4. 상단 '더보기/접기' 토글 버튼 클릭 이벤트
    $(document).on('click', '#btn-top-more', function() {
        let $descText = $(this).siblings('.desc-text');
        
        $descText.toggleClass('collapsed');
        
        if ($descText.hasClass('collapsed')) {
            $(this).html('더보기 <i class="fa-solid fa-angle-down"></i>'); 
        } 
        else {
            $(this).html('접기 <i class="fa-solid fa-angle-up"></i>'); 
        }
    });

    // 5. 하단 탭 메뉴 클릭 이벤트 (책 소개 / 작가 / 출판 정보)
    $('.tab-btn').on('click', function(e) {
        e.preventDefault();
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');

        let target = $(this).data('target');

        if (target === "desc") {
            // 🌟 수정된 부분 2: 하단 탭 메뉴를 클릭했을 때도 링크 나오게 처리 🌟
            let descText = currentBookData.contents || "내용이 없습니다.";
            let linkHtml = currentBookData.url ? `<br><br><a href="${currentBookData.url}" target="_blank" style="color:#f07c29; font-weight:bold; text-decoration:none;">👉 상세 설명 전체 보기 (카카오 도서로 이동)</a>` : '';
            
            $('#detail-tab-content').html(`<p>${descText}...</p>${linkHtml}`);
        
        } else if (target === "author") {
            let authors = currentBookData.authors.join(", ");
            let translators = currentBookData.translators.length > 0 ? currentBookData.translators.join(", ") : "없음";
            $('#detail-tab-content').html(`
                <p><strong>저자:</strong> ${authors}</p>
                <p><strong>번역:</strong> ${translators}</p>
            `);
        
        } else if (target === "publisher") {
            let pubDate = currentBookData.datetime ? currentBookData.datetime.substring(0, 10) : "정보 없음";
            $('#detail-tab-content').html(`
                <p><strong>출판사:</strong> ${currentBookData.publisher}</p>
                <p><strong>출간일:</strong> ${pubDate}</p>
                <p><strong>ISBN:</strong> ${currentBookData.isbn}</p>
            `);
        }
    });

});