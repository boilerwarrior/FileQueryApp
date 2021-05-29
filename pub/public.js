/* 添加公共元素/样式/交互 */
$(function() {
    let headerHtml = `  <div class="header">
    <div class="nav">
        <div class="nav-signin nav-item"><a href="../login/signin.html">登录</a></div>
        <div class="nav-upload nav-item disabled"><a href="../upload/upload.html">创建查询</a></div>
        <div class="nav-guestquery nav-item"><a href="../guestquery/guestQuery.html">查询</a></div>
        <div class="nav-result nav-item disabled"><a href="../result/result.html">查询结果</a></div>
    </div>
    <div class="user unshow">
        <div class="user-name"><span class="name-text">彭BUG</span></div>
        <div class="log-out">log out</div>
    </div>
</div>`;
    $('.header-wrapper').html(headerHtml);
    const currentUser = AV.User.current();
    const $header = $(".header");
    if (currentUser) {
        $header.find('.disabled').removeClass("disabled");
        $header.find('.user').removeClass('unshow').find('.name-text').text(currentUser.get('username'));
        $header.find('.log-out').on("click", function() {
            AV.User.logOut().then(() => {
                $header.find('.name-text').text('未登录');
                $('.nav-result').addClass("disabled");
                $('.nav-upload ').addClass("disabled");
                $(this).text('点击登录').off('click').on('click', function() {
                    window.location.href = "../signin.html";
                });
            }, (err) => {
                console.log(err);
            });
        });
    } else {
        $('.header').append('<span class="warn">登录后使用完整功能</span>')
    }

});