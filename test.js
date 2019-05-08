import React from 'react'
import {render} from 'react-dom'
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom';
import {Upload, Icon, message, Table, Progress, Button, Input, Modal, Menu,Tree} from 'antd';
import './App.css'


const Dragger = Upload.Dragger;
const { TreeNode } = Tree;
const Search = Input.Search;

var base = "172.18.167.38:8080/file";
// 接口地址设置
const FILELIST = 'file?kind=filelist';
const STORAGE = 'file?kind=storage';
const DOWNLOAD = 'file?kind=download';
const DELETE = 'file';
const UPLOAD = 'file?kind=upload';
const COPY = 'file?kind=copy';
const MOVE = 'file?kind=move';
const NEWFOLDER = 'file?kind=newfolder';
const USERNAME = 'file?kind=userpath';
const TREEFOLDER = 'file?kind=folderlist';
const BASEFOLDER = '/home/user/data/';

// 文件图标显示
function fileIcon(file) {
    var fileName = file.fileName;
    var s = fileName.split('.');
    var fileType = s[s.length - 1];
    var rtn = '';
    if (file.isFolder) {
        rtn = '#icon-wenjianjia';
    }
    else{
        rtn = "#icon-file"
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
            if (res !== undefined || res !== "") {
                // var tmp = JSON.parse(res);
                success(res);
            }
        },
        error: function (res) {
            if (res !== undefined) {
            }
        }
    })
}

class App extends React.Component {
    constructor(props) {
        super(props);
        // 文件的id就直接是返回列表的下标
        this.state = {
            fileList:   [],
            displayList:  [],
            used: 0,
            all: 20,
            userName: '',
            curPath:'',
            rootFolder: [],
            folderList:[],
            moveModal:false,
            copyModal:false,
        };
        CALLJSON(USERNAME, function (data) {
            var that = this;
            this.setState({
                userName: (data.userpath+"/"),
                curPath: (data.userpath+"/")
            }, () => {
                // 获取用户名之后加载文件列表
                that.loadFileList();
                // that.getRootFolder();
                that.getFolderList();
            });

        }.bind(this), null, "GET");

    }

    // 加载文件列表
    loadFileList(newPath) {
        // var path = this.state.curPath;
        var path;
        if(newPath === '' || newPath === undefined){
            path = this.state.curPath;
        }
        else{
            path = newPath;
            this.setState({
                curPath:newPath
            })
        }
        if(path[path.length-1] === '/'){
            path = path.substr(0,path.length-1);
        }
        var pathJson = JSON.stringify({"path": path});

        // 请求服务器
        CALLJSON(FILELIST, (data) => {
            this.setState({
                fileList: data.fileList,
                displayList: data.fileList

            });

            //重新加载存储容量
            this.getStorage();

        }, pathJson, "POST");

    }

    // 加载文件夹树形结构
    getFolderList(){
        CALLJSON(TREEFOLDER,(data) =>{
            var tree = data.folderList;
            var userList = tree[0].folderName.split('/');
            tree[0].folderName = userList[userList.length-1];
            console.log("get folder success");
            var a = this.setPath(tree);
            this.setState({
                folderList:a
            });
            console.log(this.state.folderList);
        },null,"POST");

    }

    // 展示树形结构
    renderTreeNodes = data => data.map((item) => {
       if(item.Children!==null){
           return (
               <TreeNode title={item.folderName} key={item.path} dataRef={item}>
                   {this.renderTreeNodes(item.Children)}
               </TreeNode>
           )
       }
       if(item.Children === null ){
           return (
               <TreeNode title={item.folderName} key={item.path} dataRef={item}>
           </TreeNode>
           )
       }
    });

    //设置path
    setPath(data,parentPath=''){

        // var rtn = data;

        if(data===null) return;
        data.map((item) => {
          if(parentPath !== ''){
              item.path = parentPath +"/" + item.folderName;
          }
          else{
              item.path = item.folderName;
          }
           this.setPath(item.Children,item.path)
        });
        // this.setState({
        //     folderList:rtn
        // });
        return data;
    }

    // 获取根目录的文件夹
    getRootFolder() {
        var userName = this.state.userName;
        if(userName[userName.length-1] === '/'){
            userName = userName.substr(0,userName.length-1);
        }
        var pathJson = JSON.stringify({"path": userName});

        // 暂时使用当前的文件列表代替，测试完改过来
        CALLJSON(FILELIST, (data) => {
            var rtn = data.fileList;
            var tmp = [];
            for (let i = 0; i < rtn.length; i++) {
                if (rtn[i].isFolder === true) {
                    tmp.push(rtn[i].fileName);
                }
            }
            this.setState({
                rootFolder: tmp
            });
        }, pathJson, "POST");

    }



    // 删除文件
    deleteFile(fileIndexs) {
        var that = this;
        Modal.confirm({
            title:"是否确认删除该文件？",
            content:"点击确认删除",
            onOk() {
                // do delete
                if (!Array.isArray(fileIndexs)) {
                    fileIndexs = [fileIndexs];
                }
                // 使用文件名列表
                var fileNames = fileIndexs.map((index) => {
                    return that.state.fileList[index].fileName;
                });
                var path = that.state.curPath;
                if (path[path.length - 1] === '/') {
                    path = path.substr(0, path.length - 1);
                }
                var dataJson = JSON.stringify({"filenames": fileNames, "path": path});

                // 删除文件接口
                CALLJSON(DELETE, (data) => {
                    // 重新加载文件列表
                    that.loadFileList();
                    if(that.state.curPath === that.state.userName){
                        that.getRootFolder();
                    }

                }, dataJson, "DELETE");
            }
        });
    }


    // 创建新文件夹
    newFolder(folderName) {
        if(folderName === undefined || folderName === ''){
            message.error("文件夹名称不能为空！");
            return;
        }
        var par = /[0-9a-zA-Z_]/;
        var flag = 1;
        for(let i = 0;i < folderName.length;i++){
            if(par.test(folderName[i]) === false){
                flag = 0;
                break;
            }
        }
        var allNames = [];
        if(this.state.fileList !== null && this.state.fileList !== []){
            allNames = this.state.fileList.map((item) => {
                return item.fileName;
            });
        }
        if (flag === 0) {
            message.error("文件夹名称不合法!");
        }
        else if (allNames !== [] && allNames.indexOf((folderName)) > -1) {
            message.error("已存在该文件夹!");
        }
        else {
            var path = this.state.curPath;
            if(path[path.length-1] === '/'){
                path = path.substr(0,path.length-1);
            }
            var dataJson = JSON.stringify({"folderName": folderName, "path": path});
            CALLJSON(NEWFOLDER, (data) => {
                // 重新更新文件夹
                this.loadFileList();
                if(this.state.curPath === this.state.userName){
                    this.getRootFolder();
                }
            }, dataJson, "POST");
        }
    }

    // 获取用户的存储信息
    getStorage() {
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

    // 复制文件弹窗显示
    showCopyModal() {
        this.setState({
            copyModal: true
        });
    }

    // 复制弹窗确认
    handleCopyOK() {
        this.setState({
            copyModal: false
        });
        if (this.state.moveTo !== undefined) {
            this.copyFile(this.state.moveTo);
        } else {
            message.error("请输入正确的选项!");
        }

    }

    // 复制弹窗取消
    handleCopyCancel() {
        this.setState({
            copyModal: false
        });

    }

    // 菜单点击处理
    handleMenuClick(e) {
        this.setState({
            moveTo: (this.state.userName + e.key)
        });
    }

    showMoveModal() {
        this.setState({
            moveModal: true
        });
    }

    // 移动弹窗确认
    handleMoveOK(){
        this.setState({
            moveModal: false
        });
        if (this.state.moveTo !== undefined) {
            this.moveFile(this.state.moveTo);
        } else {
            message.error("请输入正确的选项!");
        }
    }
    //移动弹窗取消
    handleMoveCancel() {
        this.setState({
            moveModal: false
        });

    }

    // 移动文件
    moveFile(filepath) {
        filepath = BASEFOLDER +filepath;
        // 使用文件名列表
        var fileNames = this.state.selectKeys.map((index) => {
            return this.state.fileList[index].fileName;
        });

        var path = this.state.curPath;
        if(path[path.length-1] === '/'){
            path = path.substr(0,path.length-1);
        }

        var pathJson = JSON.stringify({"filepath": filepath, "path": path, "filenames": fileNames});
        CALLJSON(MOVE, (data) => {
            this.loadFileList();
        }, pathJson, "PUT");
    }

    // 存储空间不足弹窗
    outOfStorage() {
        Modal.error({
            title: '存储空间不足',
            content: '存储空间不足无法上传',
        });
    }

    // 点击子文件夹
    intoSubFolder(folderName){
        this.loadFileList((this.state.curPath + folderName + "/"));
    }

    // 返回上一级目录
    backTo(){
        var curPath = this.state.curPath;
        if(curPath === this.state.userName){
            message.error("当前处于根目录");
            return
        }
        var tmpList = curPath.split('/');
        var now = '';
        for(let i = 0;i < tmpList.length - 2;i++){
            now += (tmpList[i] + "/")
        }
        this.loadFileList(now);

    }

    //回到主文件夹
    toRoot(){
        this.loadFileList(this.state.userName)
    }



    // 复制文件到相应的路径
    copyFile(filepath) {
        filepath = BASEFOLDER +filepath;
        // 使用文件名列表
        var fileNames = this.state.selectKeys.map((index) => {
            return this.state.fileList[index].fileName;
        });

        var path = this.state.curPath;
        if(path[path.length-1] === '/'){
            path = path.substr(0,path.length-1);
        }

        var pathJson = JSON.stringify({"filepath": filepath, "path": path, "filenames": fileNames});
        CALLJSON(COPY, (data) => {
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

    // 点击复制树形节点
    treeCopy(keys){
        console.log("copy " + keys);
        this.setState({
            moveTo: keys[0]
        })
    }

    // 点击移动树形节点
    treeMove(keys){
        console.log("move " + keys);
        this.setState({
            moveTo: keys[0]
        })
    }



    render() {
        // var a = (this.props.location.search.indexOf('?path=') === -1) ? ('?path=') : this.props.location.search;
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
                                <a href="#" onClick={this.intoSubFolder.bind(this,text)}>
                                    <svg className="icon file-icon" aria-hidden="true">
                                        <use xlinkHref={fileIcon(record)} />
                                    </svg>
                                    <span className="filename">{text}</span>
                                </a>

                            </div>

                        )
                    }
                    return (
                        <div>
                            <div className="filename-content">
                                <svg className="icon file-icon" aria-hidden="true">
                                    <use xlinkHref={fileIcon(record)} />
                                </svg>
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
                    var url = "/file?kind=download&path="+this.state.curPath+"&filename="+record.fileName;
                    return (
                        <div>
                            <a href={url} className="filelist-download-btn" style={{visibility:(record.isFolder === true ? 'hidden':'visible')}}>
                                {/*<Icon type="download" theme='filled'/>*/}
                                下载
                            </a>
                            <a href="#" className="filelist-delete-btn"
                               onClick={this.deleteFile.bind(this, record.index)}>
                                {/*<Icon type="delete"/>*/}
                                删除
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
                var mvBtn = document.getElementsByClassName('move-btn')[0];
                if (selectedRowKeys.length !== 0) {
                    delBtn.style.visibility = 'visible';
                    cpBtn.style.visibility = 'visible';
                    mvBtn.style.visibility = 'visible';
                } else {
                    delBtn.style.visibility = 'hidden';
                    cpBtn.style.visibility = 'hidden';
                    mvBtn.style.visibility = 'hidden';
                }

                //将row 的key转换为文件的id
                var ids = selectedRowKeys.map(item => {
                    return this.state.fileList[item].index;
                });

                this.setState({
                    selectKeys: ids
                }, function () {
                });


            },
        };

        // 当前的文件夹路径，存储上传文件的文件夹
        var path = this.state.curPath;
        if(path[path.length-1] === '/'){
            path = path.substr(0,path.length-1);
        }
        var tmp = UPLOAD + "&path=" + path;
        // upload btn setting
        const props = {
            action: tmp,
            data: path,
            onChange: ({file, fileList}) => {
                if (file.status !== 'uploading') {
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
                    let size = filelist[i].size / 1024 / 1024 / 1024;
                    allSize += size;
                }
                // 显示警示框
                if (filelist[filelist.length - 1] === file && allSize > (this.state.all - this.state.used)) {
                    this.outOfStorage();
                }
                return (allSize <= (this.state.all - this.state.used))
            }
        };
        var displayPath = this.state.curPath.replace(this.state.userName,"/");


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
                        <Progress className="progress" percent={(this.state.used / this.state.all * 100).toFixed(1)} status="normal"
                                  />
                        <div><span className="rongliang">容量: </span>
                                      <span className="percent">{this.state.used.toFixed(2) + "G/" + this.state.all.toFixed(2) + "G"}</span></div>
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
                            <Button className="copy-btn" onClick={this.showCopyModal.bind(this)}>
                                <Icon type="copy"/>
                                复制到
                            </Button>
                            <Modal title="复制到" visible={this.state.copyModal}
                                   onOk={this.handleCopyOK.bind(this)} onCancel={this.handleCopyCancel.bind(this)}>
                                {/*<Menu onClick={this.handleMenuClick.bind(this)} mode="vertical">*/}
                                {/*    {*/}
                                {/*        this.state.rootFolder.map((item) => {*/}
                                {/*            return (*/}
                                {/*                <Menu.Item key={item}>{item}</Menu.Item>*/}
                                {/*            )*/}
                                {/*        })*/}

                                {/*        */}
                                {/*    }*/}
                                {/*</Menu>*/}

                                <Tree
                                    onSelect={this.treeCopy.bind(this)}
                                >
                                    {this.renderTreeNodes(this.state.folderList)}
                                </Tree>

                            </Modal>
                            <Button className="move-btn" onClick={this.showMoveModal.bind(this)}>
                                <Icon type="select" />移动到
                            </Button>
                            <Modal title="移动到" visible={this.state.moveModal}
                                   onOk={this.handleMoveOK.bind(this)} onCancel={this.handleMoveCancel.bind(this)}>
                                {/*<Menu onClick={this.handleMenuClick.bind(this)} mode="vertical">*/}
                                {/*    {*/}
                                {/*        this.state.rootFolder.map((item) => {*/}
                                {/*            return (*/}
                                {/*                <Menu.Item key={item}>{item}</Menu.Item>*/}
                                {/*            )*/}
                                {/*        })*/}
                                {/*    }*/}
                                {/*</Menu>*/}

                                <Tree
                                    onSelect={this.treeMove.bind(this)}
                                >
                                    {this.renderTreeNodes(this.state.folderList)}
                                </Tree>

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
                        <div className="clf" />
                        <div className="path-div">
                            <a href="#" onClick={this.backTo.bind(this)} className="back-to">返回上一级</a>
                            <a href="#" onClick={this.toRoot.bind(this)} className="to-root">主文件夹</a>
                            <span className="cur-path">{displayPath}</span>
                        </div>
                        <div className="clf" />

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


