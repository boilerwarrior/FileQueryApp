$(function() {
    $('.nav-guestquery').addClass('active');
    $('.code-btn').on('click', function(e) {
        e.preventDefault();

        /* 获取表单数据 */
        const code = $('.code-code').val();
        const name = $('.code-name').val();
        const num = $('.code-num').val();
        var paramsJson = {
            code: code,
            name: name,
            num: num
        };
        /* 调用云函数查询 */
        AV.Cloud.run('query', paramsJson).then(function(files) {
            if (!files) {
                $('#keys-warn').removeClass("unshow");
            }
            let FIndex = 1;
            files.forEach((file) => {
                var con_item = document.createElement("div");
                con_item.setAttribute("class", `item_${FIndex++} item`);

                if (JSON.stringify(file) == "{}") {
                    $(con_item).text("此表无相关数据");
                    $(".info-data").append(con_item);
                    return;
                }
                /* 生成表格dom */
                var table_con = document.createElement("div");
                table_con.setAttribute("class", "table-con");
                $(table_con).append(`<div class='tab-title'>${file.title}</div>`);

                JstoTb(file.data, table_con); //数据表格化
                /* 生成信息确认dom */
                let confirmHtml = `<div class="confirm" iIndex="${file.index}" iId="${file.id}">
                                        <button class="confirm-ok">确认信息无误</button>
                                        <button class="confirm-err">信息有误</button>
                                    </div>
                                `
                $('.data-confirm').appendTo(confirmHtml);
                $(con_item).append(table_con, confirmHtml); //itemHtml

                $('.info-data').append(con_item);
            });
        }, function(err) {
            // 处理报错
            console.error(err);
        });
    });

    /* 绑定确定按钮点击事件 */
    $('.info-data').on('click', '.confirm', function(e) { //动态绑定，绑定到父元素上
        let isOK;
        if ($(e.target).hasClass('confirm-ok'))
            isOK = 1;
        if ($(e.target).hasClass('confirm-err'))
            isOK = 0;
        confirm(isOK, $(this));
    });
    /* 创建表格 */
    var JstoTb = function(arr, container) {
        var tablehead = Object.keys(arr);
        var table = document.createElement("table");
        container.appendChild(table);
        var tr_head = document.createElement("tr");
        table.appendChild(tr_head);
        for (let i = 0; i < tablehead.length; i++) {
            var th = document.createElement("th");
            th.setAttribute("class", "text-center");
            th.innerHTML = tablehead[i];
            tr_head.appendChild(th);
        }
        // 使用for循环将对象加入到table中去
        var tr = document.createElement("tr");
        table.appendChild(tr);
        for (let item of Object.values(arr)) {
            var td = document.createElement("td");
            td.setAttribute("class", "text-center");
            td.innerHTML = item;
            tr.appendChild(td);
        }
    }

    var confirm = function(isOK, $that) {
        const iIndex = $that.attr('iIndex');
        const iId = $that.attr('iId');
        const filedata = new AV.Query('Filedata');
        filedata.get(iId).then((data) => {
            var confirm = data.get('confirm');
            if (confirm === undefined)
                confirm = [];
            confirm[iIndex] = isOK;
            data.set('confirm', confirm);
            data.save().then(() => {
                $that.addClass('disabled');
                $that.off('click', '.info-data');
            }, (err) => {
                console.log('err');
            });
        })
    }
});