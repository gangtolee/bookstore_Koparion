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
    
// --- [Main] Top Interesting (카카오 API + 탭 기능) ---
    
    // 1. 스와이퍼 변수를 먼저 비워둔 채로 준비
    let productSwiper = null;

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

            if (productSwiper !== null) {
                productSwiper.destroy(true, true);
            }

            productSwiper = new Swiper(".productSwiper", {
                slidesPerView: 4, 
                spaceBetween: 20, 
                loop: true, //
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
        });
    }

    // 3. 처음에 '신간' 불러오기
    getBooks("신간");

    // 4. 탭 메뉴 클릭 이벤트
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

    // Main 베스트셀러 영역 (해리포터 API)
    
    // 스와이퍼를 담을 변수 미리 준비
    let bestsellerSwiper = null; 

    // 1. 책 카드 HTML을 만들어주는 보조 함수
    function createBestsellerCard(book) {
        let title = book.title;
        let price = book.sale_price > 0 ? book.sale_price : book.price;
        let oldPriceHtml = book.sale_price > 0 ? `<li class="old-price"><span class="money">₩${book.price.toLocaleString()}</span></li>` : '';

        return `
            <div class="product-wrapper mb-20">
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
        `;
    }

    // 2. 해리포터 책 데이터를 불러오는 함수
    function getBestsellerBooks(searchQuery) {
        $.ajax({
            method: "GET",
            url: "https://dapi.kakao.com/v3/search/book?target=title",
            data: { query: searchQuery, size: 8 }, 
            headers: { Authorization: "KakaoAK c9f224b560497c9acc2114158360d425" } 
        }).done(function (msg) {
            let books = msg.documents.filter(val => val.thumbnail !== '');
            $('#bestseller-book-list').empty();

            // 책을 2개씩 묶어서 하나의 슬라이드로 만들기
            for (let i = 0; i < books.length; i += 2) {
                let slideHtml = `<div class="swiper-slide">`;
                slideHtml += createBestsellerCard(books[i]);
                if (books[i + 1]) {
                    slideHtml += createBestsellerCard(books[i + 1]);
                }
                slideHtml += `</div>`;
                $('#bestseller-book-list').append(slideHtml);
            }

            if (bestsellerSwiper !== null) {
                bestsellerSwiper.destroy(true, true); 
            }
            
            bestsellerSwiper = new Swiper(".bestsellerSwiper", {
                slidesPerView: 2, 
                spaceBetween: 20, 
                loop: true, 
                navigation: {
                    // 🌟 방금 만든 커스텀 버튼 이름으로 연결!
                    nextEl: ".bestseller-nav .custom-next",
                    prevEl: ".bestseller-nav .custom-prev",
                },
                breakpoints: {
                    0: { slidesPerView: 1 },
                    768: { slidesPerView: 2 }
                }
            });
        });
    }

    // 3. 페이지가 열리면 바로 해리포터 검색 실행
    getBestsellerBooks("해리포터");

    // [Main] Featured Books 영역 (소설 API)
    
    let featuredSwiper = null;

    function createFeaturedCard(book) {
        let title = book.title;
        let price = book.sale_price > 0 ? book.sale_price : book.price;
        let oldPriceHtml = book.sale_price > 0 ? `<li class="old-price"><span class="money">₩${book.price.toLocaleString()}</span></li>` : '';

        return `
            <div class="product-wrapper mb-20">
                <div class="product-img">
                    <a href="#">
                        <img src="${book.thumbnail}" alt="책 표지" style="height: 350px; object-fit: cover;">
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
        `;
    }

    function getFeaturedBooks(searchQuery) {
        $.ajax({
            method: "GET",
            url: "https://dapi.kakao.com/v3/search/book?target=title",
            data: { query: searchQuery, size: 16 }, // 🌟 2행 4열 무한 롤링을 위해 16권으로 넉넉하게 호출!
            headers: { Authorization: "KakaoAK c9f224b560497c9acc2114158360d425" } 
        }).done(function (msg) {
            let books = msg.documents.filter(val => val.thumbnail !== '');
            $('#featured-book-list').empty();

            for (let i = 0; i < books.length; i += 2) {
                let slideHtml = `<div class="swiper-slide">`;
                
                slideHtml += createFeaturedCard(books[i]);
                
                if (books[i + 1]) {
                    slideHtml += createFeaturedCard(books[i + 1]);
                }
                
                slideHtml += `</div>`;
                $('#featured-book-list').append(slideHtml);
            }

            if (featuredSwiper !== null) {
                featuredSwiper.destroy(true, true);
            }

            featuredSwiper = new Swiper(".featuredSwiper", {
                slidesPerView: 4, 
                spaceBetween: 20, 
                loop: true,
                navigation: {
                    nextEl: ".featured-nav .custom-next", 
                    prevEl: ".featured-nav .custom-prev", 
                },
                breakpoints: {
                    0: { slidesPerView: 1 },    
                    768: { slidesPerView: 2 },  
                    992: { slidesPerView: 3 },  
                    1200: { slidesPerView: 4 }  
                }
            });
        });
    }

    getFeaturedBooks("소설");

    // 3단 카테고리 영역
    
    function getSmallBooks(searchQuery, wrapperId, swiperId, prevBtn, nextBtn) {
        $.ajax({
            method: "GET",
            url: "https://dapi.kakao.com/v3/search/book?target=title",
            data: { query: searchQuery, size: 9 }, 
            headers: { Authorization: "KakaoAK c9f224b560497c9acc2114158360d425" } 
        }).done(function (msg) {
            let books = msg.documents.filter(val => val.thumbnail !== '');
            $(wrapperId).empty();

            for (let i = 0; i < books.length; i += 3) {
                let slideHtml = `<div class="swiper-slide"><div class="product-small-list">`;
                
                for(let j = 0; j < 3; j++) {
                    if (books[i + j]) {
                        let book = books[i + j];
                        let title = book.title;
                        let price = book.sale_price > 0 ? book.sale_price : book.price;
                        
                        slideHtml += `
                            <div class="single-small-product">
                                <div class="small-product-img">
                                    <a href="#"><img src="${book.thumbnail}" alt="책 표지"></a>
                                </div>
                                <div class="small-product-content">
                                    <h4><a href="#">${title}</a></h4>
                                    <div class="price-box">
                                        <span class="money new-price">₩${price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                }
                slideHtml += `</div></div>`; 
                $(wrapperId).append(slideHtml);
            }

            new Swiper(swiperId, {
                slidesPerView: 1, 
                loop: true,
                navigation: {
                    nextEl: nextBtn,
                    prevEl: prevBtn,
                }
            });
        });
    }

    // Testimonial (고객 후기) 스와이퍼

    const testimonialSwiper = new Swiper(".testimonialSwiper", {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".testimonialSwiper .swiper-pagination",
            clickable: true,
        },
    });

    getSmallBooks("소설", "#small-list-book", "#swiper-book", "#book-prev", "#book-next");
    getSmallBooks("오디오북", "#small-list-audio", "#swiper-audio", "#audio-prev", "#audio-next");
    getSmallBooks("동화", "#small-list-children", "#swiper-child", "#child-prev", "#child-next");