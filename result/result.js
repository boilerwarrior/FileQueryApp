$(function () {
    $('.nav-result').addClass('active');
    $('.result .queryBtn').on('click', function() {
        createQ($(this)); //点击即查询生成数据Dom
        $(this).next().toggle();
    });
    var createQ = (function() {
        let flag = 0; //记录是否被初始化
        return function($that) {
            if (flag == 1)
                return;
            else
                flag = 1;
            /* 查询 */
            const query = new AV.Query("Querydata");
            query.equalTo('user', AV.User.current());
            query.find().then((data) => {
                JstoTb2(data);
                $that.next().show();
            }, (err) => {
                console.error(err);
            });
        }
    })();

    /* 点击查询详细信息 */
    $('.result').on('click', '.detail-btn', function() {
        const code = $(this).prevAll(".uni").text();
        const $that = $(this);
        /* 服务端查询 */
        const innerquery = new AV.Query("Querydata");
        innerquery.equalTo('unicode', code);
        const query = new AV.Query("Filedata");
        query.select(['data', 'title', 'confirm']);
        query.matchesQuery('unicode', innerquery);
        query.find().then((files) => {
            /* 查询结果及数据处理*/
            files.forEach((file) => {
                CreateDataHtml(file, $('.info-data'));
                $(this).addClass("disabled");
            });
        }).catch((error) => {
            console.error(error);
        });
    })

    /* 显示每条file数据相关的信息，拼接HTML，并绑定删除/折叠事件*/
    var CreateDataHtml = (function() {
        var iflag = 0;
        return function(file, containter) {
            var dataOptHtml = `<div class='data-opt'>
                                <button class='opt-isfold'>折叠</button>
                                <button class='opt-del'>删除</button>
                           </div>`;
            let classname = "data" + iflag;
            iflag++;
            var dataHtml = document.createElement("div");
            dataHtml.className = classname;
            var dataTabHtml = document.createElement("div");
            JstoTb1(file, dataTabHtml); //生成数据表格
            $(dataHtml).append(dataTabHtml, dataOptHtml);
            containter.append(dataHtml);

            /* 删除事件绑定 */
            $('.info-data').on('click', `.${classname} .opt-del`, file, (function() {
                let flag = 0; //事件调用标识。(0,未调用删除；1，已删除)
                return function(e) {
                    if (flag)
                        return;
                    if (!confirm("将会彻底删除本次数据"))
                        return;
                    e.data.destroy().then(() => {
                        flag = 1;
                        $(this).addClass("disabled").parent().prev().toggle();
                    }, (err) => {
                        console.error('删除失败，err:', err);
                    });
                }
            })());
            /* 折叠事件绑定 */
            $('.info-data').on('click', `.${classname} .opt-isfold`, function(e) {
                $(this).parent().prev().toggle();
            });
        }
    })();
    /* 生成数据表格 */
    var JstoTb1 = function(file, container) {
            var arr = file.get('data');
            var confirm = file.get('confirm');
            var tablehead = Object.keys(arr[0]);
            tablehead.push('确认情况');
            var table = document.createElement("table");
            container.appendChild(table);
            var tr_head = document.createElement("tr");
            table.appendChild(tr_head);
            for (var i = 0; i < tablehead.length; i++) {
                var th = document.createElement("th");
                th.setAttribute("class", "text-center");
                th.innerHTML = tablehead[i];
                tr_head.appendChild(th);
            }
            // 使用for循环将对象加入到table中去
            arr.forEach((obj, index) => {
                var tr = document.createElement("tr");
                table.appendChild(tr);
                var obj = Object.values(obj);
                var status = -1;
                if (confirm !== undefined)
                    status = confirm[index];

                for (let item of Object.values(obj)) {
                    var td = document.createElement("td");
                    td.setAttribute("class", "text-center");
                    td.innerHTML = item;
                    tr.appendChild(td);
                }
                var td = document.createElement("td");
                var sClassName = "confirm-status";
                var stext = "";
                if (status === 1) {
                    sClassName += " status-ok";
                    stext = "确认无误";
                } else if (status === 0) {
                    sClassName += " status-err";
                    stext = "确认有误";
                } else {
                    sClassName += " status-none";
                    stext = "待确认";
                }
                td.setAttribute("class", sClassName);
                td.innerHTML = stext;
                tr.appendChild(td);
            });
        }
        /* queryData数据表格 */
    var JstoTb2 = function(arr) {
        // const arrH = ["描述", "查询码", "截止时间", "创建时间", "更新时间", "点击查看详细信息"]
        let arrLen = arr.length;
        const curT = Date();
        let tr_head = `<tr>
                            <th>描述</th>
                            <th>查询码</th>
                            <th>截止时间</th>
                            <th>创建时间</th>
                            <th>更新时间</th>
                            <th colspan="2">操作</th>
                        </tr>
                        `;
        let allInHtml = finishInHtml = unfiInHtml = tr_head;
        for (let i = 0; i < arrLen; i++) {
            let obj = arr[i];
            let exptime = obj.get("exptime");
            var trChildsH = `<tr queryI="${i}">
                                <td class="text-center">${obj.get("des")}</td>
                                <td class="text-center uni">${obj.get("unicode")}</td>
                                <td class="text-center">${formatDate(exptime)}</td>
                                <td class="text-center">${formatDate(obj.get("createdAt"))}</td>
                                <td class="text-center">${formatDate(obj.get("updatedAt"))}</td>
                                <td class="text-center detail-btn btn">查看</td>
                                <td class="text-center delQ-btn btn">删除</td>
                            </tr>
                            `;
            if (exptime < curT) {
                unfiInHtml += trChildsH;
            } else
                finishInHtml += trChildsH;
            allInHtml += trChildsH;

        }
        const finish_item = "<div class='finish-item unshow'><table>" + finishInHtml + "</table></div>";
        const unfi_item = "<div class='unfi-item unshow'><table>" + unfiInHtml + "</table></div>";
        const all_item = "<div class='all-item unshow'><table>" + allInHtml + "</table></div>";
        $(".re-all").append(all_item);
        $(".re-unfinish").append(unfi_item);
        $(".re-finish").append(finish_item);
        /* 点击从数据库删除Querydata */
        $('.result').on('click', '.delQ-btn', function() {
            if (!confirm("将会彻底删除本次数据"))
                return;
            const index = $(this).parent().attr("queryI");
            const Qdata = arr[index];
            const query = new AV.Query('Filedata');
            query.equalTo('unicode', Qdata);
            query.find().then((files) => {
                files.forEach((file) => {
                    file.destroy();
                });
                Qdata.destroy().then(() => {
                    $(`tr[queryi='${index}'] .delQ-btn`).text("已删除").addClass("disabled").prev().addClass("disabled");
                });
            }, (err) => {
                console.error(err);
            });

        });
    }
    var formatDate = function(d) {
        const resDate = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        const resTime = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        return resDate + " " + resTime;
    }
});