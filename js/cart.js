$(document).ready(function() {

    // 1. 헤더 장바구니 숫자 업데이트 함수
    function updateHeaderCartCount() {
        let cart = JSON.parse(localStorage.getItem('koparion_cart')) || [];
        let totalCount = 0;
        cart.forEach(item => {
            totalCount += item.quantity;
        });
        $('.cart-quantity').text(totalCount);
    }
    updateHeaderCartCount(); // 페이지 로드 시 바로 실행

    // 2. 장바구니 화면 그리기 함수
    function renderCart() {
        // 로컬 스토리지에서 데이터 꺼내기
        let cart = JSON.parse(localStorage.getItem('koparion_cart')) || [];
        
        let $tbody = $('#cart-tbody');
        $tbody.empty(); // 기존 내용 지우기

        // 장바구니가 비어있을 때
        if (cart.length === 0) {
            $('#cart-content').hide();
            $('#empty-msg').show();
            return;
        }

        // 아이템이 있을 때
        $('#empty-msg').hide();
        $('#cart-content').show();

        let grandTotal = 0;

        // 표에 아이템 채워넣기
        cart.forEach(function(item, index) {
            let subtotal = item.price * item.quantity;
            grandTotal += subtotal;

            let trHtml = `
                <tr>
                    <td class="product-img">
                        <a href="sub.html?title=${item.title}"><img src="${item.thumbnail}" alt="책 표지"></a>
                    </td>
                    <td class="product-name">
                        <a href="sub.html?title=${item.title}">${item.title}</a>
                    </td>
                    <td class="product-price">₩${item.price.toLocaleString()}</td>
                    <td class="product-qty">
                        <div class="qty-box">
                            <div class="qty-btn dec" data-index="${index}">-</div>
                            <input type="text" value="${item.quantity}" class="qty-val" readonly>
                            <div class="qty-btn inc" data-index="${index}">+</div>
                        </div>
                    </td>
                    <td class="product-subtotal">₩${subtotal.toLocaleString()}</td>
                    <td class="product-remove">
                        <button class="btn-remove" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
                    </td>
                </tr>
            `;
            $tbody.append(trHtml);
        });

        // 총액 업데이트
        $('#cart-subtotal').text('₩' + grandTotal.toLocaleString());
        $('#cart-grand-total').text('₩' + grandTotal.toLocaleString());
    }

    // 3. 페이지 로드 시 장바구니 그리기
    renderCart();

    // 4. 장바구니 아이템 개별 삭제
    $(document).on('click', '.btn-remove', function() {
        let index = $(this).data('index');
        let cart = JSON.parse(localStorage.getItem('koparion_cart')) || [];
        
        if(confirm(`[${cart[index].title}]을(를) 장바구니에서 삭제하시겠습니까?`)) {
            cart.splice(index, 1); // 배열에서 해당 아이템 삭제
            localStorage.setItem('koparion_cart', JSON.stringify(cart));
            renderCart(); // 화면 다시 그리기
            updateHeaderCartCount(); // 헤더 숫자 업데이트
        }
    });

    // 5. 장바구니 전체 삭제
    $('#btn-clear-cart').on('click', function() {
        if(confirm("장바구니를 모두 비우시겠습니까?")) {
            localStorage.removeItem('koparion_cart'); // 저장소 데이터 완전 삭제
            renderCart();
            updateHeaderCartCount();
        }
    });

    // 6. 장바구니 안에서 수량 조절 (+/-)
    $(document).on('click', '.qty-btn', function() {
        let index = $(this).data('index');
        let cart = JSON.parse(localStorage.getItem('koparion_cart')) || [];
        
        if ($(this).hasClass('inc')) {
            cart[index].quantity += 1;
        } else if ($(this).hasClass('dec')) {
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                alert("수량은 1개 이상이어야 합니다.");
                return; // 수량이 1일 땐 안 줄어듦
            }
        }

        // 변경된 수량 저장 후 다시 그리기
        localStorage.setItem('koparion_cart', JSON.stringify(cart));
        renderCart();
        updateHeaderCartCount();
    });

});