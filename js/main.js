// 글로벌 환율 변환 시스템
window.formatPrice = function(krwPrice) {
    // 1. 고정 환율 설정 (포트폴리오용 대략적인 환율)
    const exchangeRates = { KRW: 1, USD: 1350, EUR: 1450, JPY: 9 };
    const currencySymbols = { KRW: '₩', USD: '$', EUR: '€', JPY: '¥' };
    
    const userCurrency = localStorage.getItem('koparion_currency') || 'KRW';
    
    let converted = krwPrice / exchangeRates[userCurrency];
    
    if (userCurrency === 'KRW' || userCurrency === 'JPY') {
        return currencySymbols[userCurrency] + Math.round(converted).toLocaleString();
    } else {
        return currencySymbols[userCurrency] + converted.toFixed(2);
    }
};

$(document).ready(function() {
    const userCurrency = localStorage.getItem('koparion_currency') || 'KRW';
    $('.current-currency').text(userCurrency + ' ▾');

    $(document).on('click', '.currency-dropdown a', function(e) {
        e.preventDefault();
        let selected = $(this).data('currency');
        localStorage.setItem('koparion_currency', selected);
        window.location.reload();
    });
});

/* 헤더 장바구니 숫자 연동 */
$(document).ready(function() {
    function updateHeaderCartCount() {
        let cart = JSON.parse(localStorage.getItem('koparion_cart')) || [];
        let totalCount = 0;
        
        cart.forEach(item => {
            totalCount += item.quantity;
        });

        $('.cart-quantity').text(totalCount);
    }

    updateHeaderCartCount();
});


// 헤더의 USD 부분
$(document).ready(function() {
    $('.currency-dropdown li a').on('click', function(e) {
        e.preventDefault();
        let selectedCurrency = $(this).data('currency');
        $('.current-currency').text(selectedCurrency + ' ▾');
    });
});
// 메인 배너 슬라이더 (Swiper)
    const mainSwiper = new Swiper(".mainSwiper", {
        loop: true,
        navigation: {
            nextEl: ".mainSwiper .swiper-button-next",
            prevEl: ".mainSwiper .swiper-button-prev",
        },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
    });
    
// Top Interesting (카카오 API + 탭 기능)

    let productSwiper = null;

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
                let oldPriceHtml = book.sale_price > 0 ? `<li class="old-price"><span class="money">${formatPrice(book.price)}</span></li>` : '';
                
                let slideHtml = `
                    <div class="swiper-slide">
                        <div class="product-wrapper">
                            <div class="product-img">
                                <a href="sub.html?title=${title}">
                                    <img src="${book.thumbnail}" alt="책 표지">
                                </a>
                            </div>
                            <div class="product-details text-center">
                                <h4><a href="sub.html?title=${title}">${title}</a></h4>
                                <div class="product-price">
                                    <ul>
                                        <li><span class="money">${formatPrice(price)}</span></li>
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
                loop: true,
                navigation: {
                    nextEl: ".productSwiper .swiper-button-next",
                    prevEl: ".productSwiper .swiper-button-prev",
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

    getBooks("신간");

    $('.tab-menu .nav li a').on('click', function(e) {
        e.preventDefault(); 
        
        $('.tab-menu .nav li a').removeClass('active');
        $(this).addClass('active');

        let tabName = $(this).text();
        
        if (tabName === "신간도서") {
            getBooks("신간");
        } else if (tabName === "특가할인") {
            getBooks("할인");
        } else if (tabName === "MD 추천도서") {
            getBooks("베스트셀러");
        }
    });

    let bestsellerSwiper = null; 

    function createBestsellerCard(book) {
        let title = book.title;
        let price = book.sale_price > 0 ? book.sale_price : book.price;
        let oldPriceHtml = book.sale_price > 0 ? `<li class="old-price"><span class="money">${formatPrice(book.price)}</span></li>` : '';

        return `
            <div class="product-wrapper mb-20">
                <div class="product-img">
                    <a href="sub.html?title=${title}">
                        <img src="${book.thumbnail}" alt="책 표지">
                    </a>
                </div>
                <div class="product-details text-center">
                    <h4><a href="sub.html?title=${title}">${title}</a></h4>
                    <div class="product-price">
                        <ul>
                            <li><span class="money">${formatPrice(price)}</span></li>
                            ${oldPriceHtml}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    function getBestsellerBooks(searchQuery) {
        $.ajax({
            method: "GET",
            url: "https://dapi.kakao.com/v3/search/book?target=title",
            data: { query: searchQuery, size: 8 }, 
            headers: { Authorization: "KakaoAK c9f224b560497c9acc2114158360d425" } 
        }).done(function (msg) {
            let books = msg.documents.filter(val => val.thumbnail !== '');
            $('#bestseller-book-list').empty();

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

    getBestsellerBooks("해리포터");
    
    let featuredSwiper = null;

    function createFeaturedCard(book) {
        let title = book.title;
        let price = book.sale_price > 0 ? book.sale_price : book.price;
        let oldPriceHtml = book.sale_price > 0 ? `<li class="old-price"><span class="money">${formatPrice(book.price)}</span></li>` : '';

        return `
            <div class="product-wrapper mb-20">
                <div class="product-img">
                    <a href="sub.html?title=${title}">
                        <img src="${book.thumbnail}" alt="책 표지" style="height: 350px; object-fit: cover;">
                    </a>
                </div>
                <div class="product-details text-center">
                    <h4><a href="sub.html?title=${title}">${title}</a></h4>
                    <div class="product-price">
                        <ul>
                            <li><span class="money">${formatPrice(price)}</span></li>
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
            data: { query: searchQuery, size: 16 },
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
                                    <a href="sub.html?title=${title}"><img src="${book.thumbnail}" alt="책 표지"></a>
                                </div>
                                <div class="small-product-content">
                                    <h4><a href="sub.html?title=${title}">${title}</a></h4>
                                    <div class="price-box">
                                        <span class="money new-price">${formatPrice(price)}</span>
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