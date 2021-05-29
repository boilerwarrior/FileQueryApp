function login(loginStatus) {

    const username = $("#inputUsername").val();
    const password = $("#inputPassword").val();

    AV.User[loginStatus](username, password)
        .then(() => {
            $('.info').addClass('unshow')
            console.log(loginStatus);
            window.location.href = "../upload/upload.html";
        })
        .catch(({ error }) => {
            $('.info').text("账号或密码错误");
        });
}
$(function() {
    $('.nav-signin').addClass('active');

    $('.form-signin').on('submit', function(e) {
        e.preventDefault();
        login('logIn');
        console.log(1);
    });
    $('.form-signup').on('submit', function(e) {
        e.preventDefault();
        login('signUp');
        console.log(2);
    });
    $('.signIn:not(.active)').on('click', function() {
        window.location.href = "./signin.html";
    });
    $('.signUp:not(.active)').on('click', function() {
        console.log(1);
        window.location.href = "./signup.html";
    });
});