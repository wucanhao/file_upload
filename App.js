import React from 'react'
import {render} from 'react-dom'
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom';
import {Upload, Icon, message, Table, Progress, Button, Input, Modal, Menu, Dropdown} from 'antd';

const Dragger = Upload.Dragger;
import './App.css'

const Search = Input.Search;

var base = "172.18.167.38:8080/file";
// 接口地址设置
const FILELIST = 'file?kind=filelist';
const STORAGE = 'file?kind=storage';
const DOWNLOAD = 'file?kind=download';
const DELETE = 'file';
const UPLOAD = 'file?kind=upload';
const MOVE = 'file';
const NEWFOLDER = 'file?kind=newfolder';
const USERNAME = 'file?kind=userpath';


// 文件图标显示
function fileIcon(fileName) {

    var s = fileName.split('.');
    var fileType = s[s.length - 1];
    var rtn = '';
    switch (fileType) {
        case 'txt':
            rtn = 'file-text';
            break;
        case 'pdf':
            rtn = 'file-pdf';
            break;
        case 'ppt':
            rtn = 'file-ppt';
            break;
        case 'jpg':
            rtn = 'file-jpg';
            break;
        case 'xlsx':
            rtn = 'file-excel';
            break;
        default:
            rtn = 'file';
    }
    if (fileName[fileName.length - 1] === '/') {
        rtn = 'folder';
    }
    return rtn;
}

function CALLJSON(url, success, data, type) {
    $.ajax({
        type: type,
        url: url,
        data: data,
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (res) {
            console.log("返回用户路径:" + res);
            if (res !== undefined || res !== "") {
                // var tmp = JSON.parse(res);
                success(res);
            }
        },
        error: function (res) {
            if (res !== undefined) {
                console.log(res);
            }
        }
    })
}

class App extends React.Component {
    constructor(props) {
        super(props);
        // 文件的id就直接是返回列表的下标
        this.state = {
            fileList:  [
                {
                    index: 0,
                    fileName: "1.txt",
                    fileSize: "1kb",
                    fileDate: "2019/1/2",
                    isFolder: false
                },
                {
                    index: 1,
                    fileName: "2.pdf",
                    fileSize: "1kb",
                    fileDate: "2019/1/2",
                    isFolder: false
                },
                {
                    index: 2,
                    fileName: "test",
                    fileSize: "1kb",
                    fileDate: "2019/1/2",
                    isFolder: true
                },
                {
                    index: 3,
                    fileName: "test2",
                    fileSize: "1kb",
                    fileDate: "2019/1/2",
                    isFolder: true
                },
            ],
            displayList:  [
                {
                    index: 0,
                    fileName: "1.txt",
                    fileSize: "1kb",
                    fileDate: "2019/1/2",
                    isFolder: false
                },
                {
                    index: 1,
                    fileName: "2.pdf",
                    fileSize: "1kb",
                    fileDate: "2019/1/2",
                    isFolder: false
                },
                {
                    index: 2,
                    fileName: "test",
                    fileSize: "1kb",
                    fileDate: "2019/1/2",
                    isFolder: true
                },
                {
                    index: 3,
                    fileName: "test2",
                    fileSize: "1kb",
                    fileDate: "2019/1/2",
                    isFolder: true
                },
            ],
            selectKeys: [],
            rootFolder: [                {
                index: 2,
                fileName: "test",
                fileSize: "1kb",
                fileDate: "2019/1/2",
                isFolder: true
            },
                {
                    index: 3,
                    fileName: "test2",
                    fileSize: "1kb",
                    fileDate: "2019/1/2",
                    isFolder: true
                },],
            used: 0,
            all: 20,
            userName: 'root/'
        };
        CALLJSON(USERNAME, function (data) {
            console.log(data.userpath);
            var that = this;
            this.setState({
                userName: data.userpath
            }, () => {
                // 获取用户名之后加载文件列表
                that.loadFileList();
                that.getRootFolder();
            });
            console.log(this.state.userName)

        }.bind(this), null, "GET");
    }

    // 获取当前用户路径
    getUserName() {
        var that = this;
        CALLJSON(USERNAME, (data) => {
            console.log(data.userpath);
            that.setState({
                userName: (data.userpath+"/")
            }, () => {
                // 获取用户名之后加载文件列表
                this.loadFileList();
                this.getRootFolder();
            })

        }, null, "GET")
    }

    // 获取当前所处的路径
    getPath() {
        var tmp = this.props.location.search;
        var index = tmp.indexOf('?path=');
        var path = this.state.userName;
        if (index > -1) {
            path = this.state.userName + tmp.substr(index + 6,);
        }
        return path;
    }

    // 加载文件列表
    loadFileList() {
        var path = this.getPath();
        var pathJson = JSON.stringify({"path": path});
        console.log("load file list " + pathJson);

        // 请求服务器
        CALLJSON(FILELIST, (data) => {
            this.setState({
                fileList: data.fileList,
                displayList: data.fileList

            });
            console.log("sucess load fileList");

            //重新加载存储容量
            this.getStorage();

        }, pathJson, "POST");

    }

    // 获取根目录的文件夹
    getRootFolder() {
        var userName = this.state.userName;
        var pathJson = JSON.stringify({"path": userName});

        // 暂时使用当前的文件列表代替，测试完改过来
        var rtn = [];
        CALLJSON(FILELIST, (data) => {
            rtn = data.fileList;
        }, pathJson, "POST");
        var tmp = [];
        for (let i = 0; i < rtn.length; i++) {
            if (rtn[i].isFolder === true) {
                tmp.push(rtn[i]);
            }
        }
        this.setState({
            rootFolder: tmp
        });

    }


    // 下载文件
    // downloadFile(fileIndexs) {
    //     if (!Array.isArray(fileIndexs)) {
    //         fileIndexs = [fileIndexs];
    //     }
    //     // 使用文件名列表
    //     var fileNames = fileIndexs.map((index) => {
    //         return this.state.fileList[index].fileName;
    //     });
    //     // do download
    //     console.log("download files in the folder " + this.getPath() + " " + fileNames);
    //     var dataJson = JSON.stringify({"filename": fileNames, "path": this.getPath()});
    //     var tmp = DOWNLOAD + ""
    //
    //     // 下载文件
    //     CALLJSON(DOWNLOAD, (data) => {
    //         console.log("download sucess");
    //     }, dataJson, "GET");
    //
    // }

    // 删除文件
    deleteFile(fileIndexs) {
        // do delete
        if (!Array.isArray(fileIndexs)) {
            fileIndexs = [fileIndexs];
        }
        // 使用文件名列表
        var fileNames = fileIndexs.map((index) => {
            return this.state.fileList[index].fileName;
        });
        console.log("delete files in the folder " + this.getPath() + " " + fileNames);
        var dataJson = JSON.stringify({"filenames": fileNames, "path": this.getPath()});

        // 删除文件接口
        CALLJSON(DELETE, (data) => {
            console.log("delete sucess");
            // 重新加载文件列表
            this.loadFileList();

        }, dataJson, "DELETE");
    }


    // 创建新文件夹
    newFolder(folderName) {
        var par = /[0-9a-zA-Z_]/;
        var flag = 1;
        for(let i = 0;i < folderName.length;i++){
            if(par.test(folderName[i]) === false){
                flag = 0;
                break;
            }
        }
        var allNames = this.state.fileList.map((item) => {
            return item.fileName;
        });
        console.log(allNames);

        console.log("folder name " + folderName);
        if (flag === 0) {
            message.error("文件夹名称不合法!");
        } else if (allNames.indexOf((folderName)) > -1) {
            message.error("已存在该文件夹!");
        } else {
            var dataJson = JSON.stringify({"folderName": folderName, "path": this.getPath()});
            CALLJSON(NEWFOLDER, (data) => {
                console.log("new floder sucess");
                // 重新更新文件夹
                this.loadFileList();
            }, dataJson, "POST");
        }
    }

    // 获取用户的存储信息
    getStorage() {
        console.log("get storage");
        // 获得存储空间
        CALLJSON(STORAGE, (data) => {
            this.setState({
                used: data.used,
                all: data.all
            })
        }, null, "GET");
    }


    // 创建文件夹弹窗
    showFolderModal() {
        // do new folder
        this.setState({
            folderModal: true
        });

    }

    // 弹窗确定按钮
    handleFolderOK(e) {
        this.setState({
            folderModal: false
        });
        var inputName = document.getElementsByClassName('new-floder-input')[0];
        // 创建对应的文件夹
        this.newFolder(inputName.value);
        inputName.value = '';

    }

    // 弹窗取消按钮
    handleFolderCancel() {
        message.info("cancel");
        this.setState({
            folderModal: false
        });
    }

    // 复制到文件弹窗显示
    showMoveModal() {
        this.setState({
            moveModal: true
        });
    }

    // 复制弹窗确认
    handleMoveOK() {
        this.setState({
            moveModal: false
        });
        if (this.state.moveTo !== undefined) {
            this.moveFile(this.state.moveTo);
        } else {
            message.error("请输入正确的选项!");
        }

    }

    // 复制弹窗取消
    handleMoveCancel() {
        this.setState({
            moveModal: false
        });

    }

    // 复制菜单点击处理
    handleMenuClick(e) {
        this.setState({
            moveTo: (this.state.userName + e.key)
        });
    }


    // 存储空间不足弹窗
    outOfStorage() {
        Modal.error({
            title: '存储空间不足',
            content: '存储空间不足无法上传',
        });
    }

    // 复制文件到相应的路径
    moveFile(filepath) {
        console.log("move file to " + filepath + ":  index: " + this.state.selectKeys);
        // 使用文件名列表
        var fileNames = this.state.selectKeys.map((index) => {
            return this.state.fileList[index].fileName;
        });
        var pathJson = JSON.stringify({"filepath": filepath, "path": this.getPath(), "filenames": fileNames});
        CALLJSON(MOVE, (data) => {
            this.loadFileList();
        }, pathJson, "PUT");
    }

    // 搜索框
    handleSearch(value) {
        if (value === '') {
            this.setState({
                displayList: this.state.fileList
            });
            return
        }
        var tmp = [];
        for (let i = 0; i < this.state.fileList.length; i++) {
            if (this.state.fileList[i].fileName.indexOf(String(value)) > -1) {
                tmp.push(this.state.fileList[i]);
            }
        }
        this.setState({
            displayList: tmp
        });
    }

    // 刷新按钮
    handleUpdate() {
        this.loadFileList();
    }


    render() {
        var a = (this.props.location.search.indexOf('?path=') === -1) ? ('?path=') : this.props.location.search;
        // table 的列定义
        var cols = [
            {
                title: "文件名",
                dataIndex: "fileName",
                className: "file-table-name",
                width: "25%",
                render: (text, record) => {

                    // 是否是文件夹
                    var isFolder = this.state.fileList[record.index].isFolder;
                    if (isFolder) {
                        return (
                            <div className="filename-content">

                                <Link to={a + text + "/"}>
                                    <Icon type={fileIcon(text)} theme="filled" className="file-icon"/>
                                    <span className="filename">{text}</span>
                                </Link>

                            </div>

                        )
                    }
                    return (
                        <div>
                            <div className="filename-content">
                                <Icon type={fileIcon(text)} theme="filled" className="file-icon"/>
                                <span className="filename">{text}</span>

                            </div>
                        </div>
                    )


                },
            },
            {
                title: "大小",
                dataIndex: "fileSize",
                className: "file-table-size",
                width: "25%"
            },
            {
                title: "修改日期",
                dataIndex: "fileDate",
                className: "file-table-date",
                width: "25%"
            },
            {
                title: '操作',
                dataIndex: '',
                key: 'x',
                render: (text, record) => {
                    var url = "/file?kind=download&path="+this.getPath()+"&filename="+record.fileName;
                    return (
                        <div>
                            <a href={url} className="filelist-download-btn">
                                <Icon type="download" theme='filled'/>
                            </a>
                                <a href="#" className="filelist-delete-btn"
                               onClick={this.deleteFile.bind(this, record.index)}>
                                <Icon type="delete"/>
                            </a>
                        </div>
                    )
                }
            }
        ];

        // 获取checkbox选择的标签
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                var delBtn = document.getElementsByClassName('delete-btn')[0];
                var cpBtn = document.getElementsByClassName('copy-btn')[0];
                if (selectedRowKeys.length !== 0) {
                    message.info((cols[0].title = '已选中' + selectedRowKeys.length + "个文件"), 1);
                    delBtn.style.visibility = 'visible';
                    cpBtn.style.visibility = 'visible';
                } else {
                    delBtn.style.visibility = 'hidden';
                    cpBtn.style.visibility = 'hidden';
                }

                //将row 的key转换为文件的id
                var ids = selectedRowKeys.map(item => {
                    return this.state.fileList[item].index;
                });
                console.log("select row keys: " + selectedRowKeys);


                this.setState({
                    selectKeys: ids
                }, function () {
                    console.log("state key " + this.state.selectKeys);
                });


            },
        };

        // 当前的文件夹路径，存储上传文件的文件夹
        var path = {"path": this.getPath()};
        var tmp = UPLOAD + "&path=" + this.getPath();
        // upload btn setting
        const props = {
            action: tmp,
            data: path,
            onChange: ({file, fileList}) => {
                if (file.status !== 'uploading') {
                    console.log("now upload file: " + file.name);
                    if (file.name === fileList[fileList.length - 1].name) {
                        // 上传所有的文件之后，重新加载文件列表
                        this.loadFileList();
                    }
                }
                if (file.status === 'done') {
                    message.success(file.name + " 上传成功!", 1);
                }
                if (file.status === 'error') {
                    message.error(file.name + " 上传失败!", 1);
                }
            },
            showUploadList: true,
            multiple: true,
            beforeUpload: (file, filelist) => {
                var allSize = 0;
                for (var i = 0; i < filelist.length; i++) {
                    let size = filelist[i].size / 1024 / 1024;
                    allSize += size;
                }
                // 显示警示框
                if (filelist[filelist.length - 1] === file && allSize > (this.state.all - this.state.used)) {
                    this.outOfStorage();
                }
                return (allSize <= (this.state.all - this.state.used))
            }
        };


        return (
            <div className="page">

                <div className="left-aside">
                    <div className="upload-div">
                        <Upload {...props} className="upload-btn">
                            <Button type="primary" className="upload-btn">
                                <Icon type='upload'/>上传
                            </Button>
                        </Upload>
                    </div>

                    <div className="storage">
                        <Progress className="progress" percent={parseInt(this.state.used / this.state.all * 100)}
                                  width={50}/>
                        <span className="rongliang">容量: </span>
                        <span className="percent">{this.state.used + "G/" + this.state.all + "G"}</span>
                    </div>
                </div>

                <div className="detail">
                    <div className="btns">
                        <Button className="new-floder" onClick={this.showFolderModal.bind(this)}>
                            <Icon type="folder-add"/>新建文件夹
                        </Button>
                        <Modal title='创建文件夹' visible={this.state.folderModal}
                               onOk={this.handleFolderOK.bind(this)} onCancel={this.handleFolderCancel.bind(this)}>
                            <Input placeholder="新文件夹名称" autosize={false} className="new-floder-input"/>
                        </Modal>

                        <Button.Group className="btn-group">
                            {/*<Button className="download-btn"*/}
                            {/*        onClick={this.downloadFile.bind(this, this.state.selectKeys)}>*/}
                            {/*    <Icon type='download'/>下载*/}
                            {/*</Button>*/}
                            <Button className='delete-btn' onClick={this.deleteFile.bind(this, this.state.selectKeys)}>
                                <Icon type='delete'/>删除
                            </Button>
                            <Button className="copy-btn" onClick={this.showMoveModal.bind(this)}>
                                <Icon type="copy"/>
                                复制到
                            </Button>
                            <Modal title="复制到" visible={this.state.moveModal}
                                   onOk={this.handleMoveOK.bind(this)} onCancel={this.handleMoveCancel.bind(this)}>
                                <Menu onClick={this.handleMenuClick.bind(this)} mode="vertical">
                                    {
                                        this.state.rootFolder.map((item) => {
                                            return (
                                                <Menu.Item key={item.fileName}>{item.fileName}</Menu.Item>
                                            )
                                        })
                                    }
                                </Menu>

                            </Modal>
                        </Button.Group>

                        <Search className="search"
                                placeholder="input search text"
                                onSearch={value => this.handleSearch(value)}
                                style={{width: 200}}
                        />
                        <Button className='update-btn' type="primary" onClick={this.handleUpdate.bind(this)}>
                            <Icon type="sync"/>刷新
                        </Button>

                    </div>

                    <div className="table">
                        <Table className="file-table" dataSource={this.state.displayList} bordered={false}
                               rowSelection={rowSelection} columns={cols} pagination={false}/>
                    </div>

                </div>
            </div>
        )
    }

}

export default App;


