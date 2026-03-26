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

    function renderCart() {
        let cart = JSON.parse(localStorage.getItem('koparion_cart')) || [];
        
        let $tbody = $('#cart-tbody');
        $tbody.empty();

        if (cart.length === 0) {
            $('#cart-content').hide();
            $('#empty-msg').show();
            return;
        }

        $('#empty-msg').hide();
        $('#cart-content').show();

        let grandTotal = 0;

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

        $('#cart-subtotal').text('₩' + grandTotal.toLocaleString());
        $('#cart-grand-total').text('₩' + grandTotal.toLocaleString());
    }

    renderCart();

    let itemToDeleteIndex = null;

    $(document).on('click', '.btn-remove', function() {
        itemToDeleteIndex = $(this).data('index');
        $('#delete-modal').fadeIn(200);
    });

    $(document).on('click', '#btn-cancel-delete', function() {
        itemToDeleteIndex = null;
        $('#delete-modal').fadeOut(200);
    });

    $(document).on('click', '#btn-confirm-delete', function() {
        if (itemToDeleteIndex !== null) {
            let cart = JSON.parse(localStorage.getItem('koparion_cart')) || [];
            cart.splice(itemToDeleteIndex, 1);
            
            localStorage.setItem('koparion_cart', JSON.stringify(cart));
            
            renderCart();
            updateHeaderCartCount();
            
            itemToDeleteIndex = null;
            $('#delete-modal').fadeOut(200);
        }
    });

    $('#btn-clear-cart').on('click', function() {
        if(confirm("장바구니를 모두 비우시겠습니까?")) {
            localStorage.removeItem('koparion_cart');
            renderCart();
            updateHeaderCartCount();
        }
    });

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
                return;
            }
        }

        localStorage.setItem('koparion_cart', JSON.stringify(cart));
        renderCart();
        updateHeaderCartCount();
    });

});