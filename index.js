import React from 'react'
import { render } from 'react-dom'
import { Upload, Icon, message, Table ,Row,Col,Card,Button} from 'antd';
const Dragger = Upload.Dragger;
// import 'antd/dist/iconfont/iconfont.css'
// import 'antd/dist/antd.css';
    function CALLJSON(url,success,data){
    $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(data),
        contentType:'application/json;charset=utf-8',
        dataType: 'json',
        success: function(data){
            if(data!=undefined||data!=""){
                success(data);
            }
        },
        error:function (data) {
            if(data!=undefined){
                console.log(data);
            }
        }
    })
}
var Index = React.createClass({
    getInitialState () {
        CALLJSON("fileList",function (data) {
            if(data!=undefined||data!=""){
                this.setState({source:data})
            }
        }.bind(this));
        return{
            source:[],
        }
    },
    loadFileList:function () {
        CALLJSON("fileList",function (data) {
            if(data!=undefined||data!=""){
                console.log(data)
                this.setState({source:data})
            }
        }.bind(this))
    },
    render: function () {
        const columns = [{
            title: 'fileName',
            dataIndex: 'name',
            width: 400,
        }, {
            title: 'fileSize',
            dataIndex: 'size',
            width: 200,
        }, {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: (text,record) => <a href={"/download/"+record.name}>Download</a>

        },];
        const props = {
            name: 'file',
            multiple: true,
            action: 'upload',
            onChange(info) {
                const status = info.file.status;
                if (status === 'done') {
                    message.success(`${info.file.name} file uploaded successfully.`);
                } else if (status === 'error') {
                    message.error(`${info.file.name} file upload failed.`);
                }
            },
        };

        return (<div style={{ background: '#ECECEC', padding: '30px' ,height:'100%',overflow:'hidden'}}>
            <Row gutter={16} style={{paddingBottom:'50px'}}>
                <Col span={24}>
                <Card style={{height:80}} >
                    <div style={{fontSize:'16px',textOverflow:'ellipsis',fontWeight:'600',display:'inline-block'}}>文件上传和下载</div>
                </Card>
            </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Upload (directory:/workshop)" bordered={false} style={{height:550}}>
                        <div style={{height:470,'overflow-y':'auto'}}>
                            <div style={{padding: '0px 100px 0px 100px'}}>
                                <Dragger {...props}>
                                    <p className="ant-upload-drag-icon">
                                        <Icon type="inbox" />
                                    </p>
                                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                    <p className="ant-upload-hint">Support for a single or bulk upload.</p>
                                </Dragger>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Download (directory:/workshop)" bordered={false} style={{height:550}} extra={<Button onClick={this.loadFileList} type="primary" shape="circle" icon="reload"/>}>
                        <Table columns={columns} dataSource={this.state.source} pagination={{ pageSize: 10 }} scroll={{ y: 350 }} />
                    </Card>
                </Col>
            </Row>
        </div>)
    }
})
render(<Index/>
    , document.getElementById('index'));
