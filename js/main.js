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