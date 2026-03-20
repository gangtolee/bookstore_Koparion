// 헤더의 USD 부분
$(document).ready(function() {
    // 1. 드롭다운 안의 항목(li a)을 클릭했을 때
    $('.currency-dropdown li a').on('click', function(e) {
        e.preventDefault(); // 링크 클릭 시 위로 튕겨 올라가는 현상 방지
        
        // 2. 내가 클릭한 녀석의 숨겨진 데이터('USD', 'EUR' 등) 가져오기
        let selectedCurrency = $(this).data('currency');
        
        // 3. 메인 글자를 내가 선택한 글자로 바꿔치기!
        $('.current-currency').text(selectedCurrency + ' ▾');
    });
});
// --- 메인 배너 슬라이더 (Swiper) ---
    const mainSwiper = new Swiper(".mainSwiper", {
        loop: true, // 끝까지 가면 다시 처음으로 무한 반복!
        navigation: {
            nextEl: ".mainSwiper .swiper-button-next",
            prevEl: ".mainSwiper .swiper-button-prev",
        },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false, // 마우스로 건드려도 자동 재생 유지
        },
    });

    // --- [Main] Top Interesting (카카오 API + 탭 기능) ---
    
    // 1. 스와이퍼(슬라이더) 초기 설정 (한 화면에 4개씩!)
    const productSwiper = new Swiper(".productSwiper", {
        slidesPerView: 4, 
        spaceBetween: 20, 
        navigation: {
            nextEl: ".productSwiper .swiper-button-next",
            prevEl: ".productSwiper .swiper-button-prev",
        },
        breakpoints: {
            0: { slidesPerView: 1 },    // 모바일
            768: { slidesPerView: 2 },  // 태블릿
            992: { slidesPerView: 3 },  // 작은 PC
            1200: { slidesPerView: 4 }  // 큰 PC
        }
    });

    // 2. 책 데이터를 불러와서 꽂아넣는 함수
    function getBooks(searchQuery) {
        $.ajax({
            method: "GET",
            url: "https://dapi.kakao.com/v3/search/book?target=title",
            data: { query: searchQuery, size: 8 }, 
            headers: { Authorization: "KakaoAK c9f224b560497c9acc2114158360d425" } 
        }).done(function (msg) {
            
            let books = msg.documents.filter(val => val.thumbnail !== '');

            $('#book-list').empty();

            books.forEach(book => {
                let title = book.title;
                let price = book.sale_price > 0 ? book.sale_price : book.price; 
                let oldPriceHtml = book.sale_price > 0 ? `<li class="old-price"><span class="money">₩${book.price.toLocaleString()}</span></li>` : '';
                
                let slideHtml = `
                    <div class="swiper-slide">
                        <div class="product-wrapper">
                            <div class="product-img">
                                <a href="#">
                                    <img src="${book.thumbnail}" alt="책 표지">
                                </a>
                            </div>
                            <div class="product-details text-center">
                                <h4><a href="#">${title}</a></h4>
                                <div class="product-price">
                                    <ul>
                                        <li><span class="money">₩${price.toLocaleString()}</span></li>
                                        ${oldPriceHtml}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                $('#book-list').append(slideHtml);
            });

            productSwiper.update();
        });
    }

    getBooks("신간");

    $('.tab-menu .nav li a').on('click', function(e) {
        e.preventDefault(); 
        
        $('.tab-menu .nav li a').removeClass('active');
        $(this).addClass('active');

        let tabName = $(this).text();
        
        if (tabName === "NEW ARRIVAL") {
            getBooks("신간");
        } else if (tabName === "ONSALE") {
            getBooks("할인");
        } else if (tabName === "FEATURED PRODUCTS") {
            getBooks("베스트셀러");
        }
    });