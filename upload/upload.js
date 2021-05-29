function xlsxChange(data) {
    try {
        var workbook = XLSX.read(data, {
                type: 'binary'
            }) // 以二进制流方式读取得到整份excel表格对象
        var persons = []; // 存储获取到的数据
    } catch (e) {
        console.error('文件类型不正确');
        return;
    }
    // 表格的表格范围，可用于判断表头是否数量是否正确
    var fromTo = '';
    // 遍历每张表读取
    for (var sheet in workbook.Sheets) {
        if (workbook.Sheets.hasOwnProperty(sheet)) {
            fromTo = workbook.Sheets[sheet]['!ref'];
            console.log(fromTo);
            persons = persons.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
            // persons = persons.concat(XLSX.utils.sheet_to_html(workbook.Sheets[sheet]));
            //break; // 如果只取第一张表，就取消注释这行
        }
    }
    return persons;
}
$(function() {
    $('.nav-upload').addClass('active');

    /* datetime插件初始化 */
    laydate.render({ elem: '#time', type: 'datetime' });

    /* 事件绑定 */
    $('.btn_sub').on('click', function(e) {
        e.preventDefault();
        var unicode = '';
        var filesdata = [];
        const files = $('#file')[0].files;
        const time = $('#time').val();
        const des = $('#des').val();

        const exptime = new Date(time);

        /* 有文件和时间时才能上传 */
        if (files.length == 0 || !time) {
            $('.info-alarm').removeClass('unshow');
            return;
        } else
            $('.info-alarm').removeClass('unshow').addClass('unshow');

        /* file文件转换 */
        for (let file of files) { //List用for of遍历
            var fileReader = new FileReader();
            fileReader.onload = function(ev) {
                const data = ev.target.result;
                let X = {}; //当前表数据：data/name
                X.data = xlsxChange(data); //返回json数组
                X.filename = file.name;
                filesdata.push(X);
            };
            fileReader.readAsBinaryString(file); // 以二进制方式打开文件
        }

        /* 生成本次查询数据 */
        const Querydata = AV.Object.extend('Querydata');
        const querydata = new Querydata();
        querydata.set('user', AV.User.current());
        querydata.set('exptime', exptime);
        querydata.set('des', des);
        querydata.save().then((thisQ) => {
            /* 查询本次邀请码（服务端生成) */
            const query = new AV.Query('Querydata');
            query.select(['unicode']);
            query.get(thisQ.id).then((item) => {
                unicode = item.get('unicode');
                $('.info-query').text('本次查询码为：' + unicode);
            }, (erro) => {
                $('.info-query').text(erro);
            });
            /* 生成服务端filedata数据 */
            filesdata.forEach(function(Data) {
                const Filedata = AV.Object.extend('Filedata');
                const filedata = new Filedata();
                filedata.set('data', Data.data);
                filedata.set('unicode', thisQ);
                filedata.set('title', Data.filename);
                filedata.save();
            })
        }, (error) => {
            console.error(error);
        });
    });
});