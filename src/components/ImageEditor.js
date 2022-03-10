import React, { Component } from 'react';
import canvasToImage from 'canvas-to-image';
import AvatarEditor from 'react-avatar-editor';
import Cropper from './Cropper';
import { renderToStaticMarkup } from 'react-dom/server';
import RotateSlider from './RotateSlider';
import '../styles/ImageEditor.css';
import Button from '@govuk-react/button';
import Label from '@govuk-react/label-text';



class ImageEditor extends Component
{

    constructor(props)
    {
      super(props);
      this.state = {
        editorWidth: 0,
        editorHeight: 0,
        isEditorSizeChanged: true,
        originalImg: {
            imgData: "",
            height: 0,
            width: 0
        },
        imgData: "",
        isToolsDisabled: true,
        isFileChooserDisabled: false,
        rotateValue: 0,
        scaleFactor: 1,
        mainCanvasVisibleStyle: {
            display: 'inline-block'
        },
        cropperVisibleStyle: {
            display: 'none'
        },
        imageEditorWrapperStyle: {
            margin: '0 auto',
            width: '800px'
        },
        imgCropData: "",
        cropSubmitBtn: ""
      }

    }


    resetEditor = () =>
    {
      let originalImg = this.state.originalImg;
      this.setState({
        imgData: originalImg.imgData,
        editorWidth: originalImg.width,
        editorHeight: originalImg.height,
        scaleFactor: 1,
        rotateValue:0,
        isEditorSizeChanged: true,
        imageEditorWrapperStyle: {
            width: originalImg.width,
            margin: '0 auto'
        }
      });
    }



    componentDidMount(){
      let cropSubmitBtn = this.refs.cropSubmit;
      this.setState({cropSubmitBtn: cropSubmitBtn});
    }


    resizeImage = (sign) =>
    {
      let size = sign == 1 ? 1.2 : 0.8;
      let width = this.state.editorWidth * size;
      let height = this.state.editorHeight * size;
    
      this.setState({
          editorWidth: width,
          editorHeight: height
      });
    }

    setScaleFactor(sign){
      let factor = this.state.scaleFactor + 0.2 * sign;
      this.setState({
          scaleFactor: factor,
          isEditorSizeChanged: true
      });
    }


    setRotateFromTxt(){
      let value = this.refs.rotationTxt.value;
      this.setState({rotateValue: value});
    }



    setRotateValue = (value) => 
    {
      this.setState({
          rotateValue : value
      });

      if(this.state.isEditorSizeChanged)
      {
        let width = this.state.editorWidth;
        let height = this.state.editorHeight;
        let largerSize = (width > height ? width : height) * 1.2;

        this.setState({
            editorWidth: largerSize,
            editorHeight: largerSize,
            scaleFactor: 0.5,
            isEditorSizeChanged: false
        });
      }
    }



    loadFile = () =>
    {
      var file = document.querySelector('input[type=file]').files[0];
      var reader = new FileReader();
      var _this = this;

      reader.onloadend = function ()
      {
        _this.resetEditor();
        let image = new Image();
      
        image.onload = function()
        {
          _this.setState({
              editorWidth: image.width,
              editorHeight: image.height,
              originalImg: {
                imgData: reader.result,
                width: image.width,
                height: image.height
              },
              imageEditorWrapperStyle: {
                width: image.width,
                margin: '0 auto'
              }
            });
        };          

        image.src = reader.result;
        _this.setState({
            imgData: reader.result,
            isToolsDisabled: false
        });
      }
    
      if (file) {
          reader.readAsDataURL(file);
      }
    }


    toggleCropper(isToggled)
    {
      let _this = this;
      this.setStyle = function(cropper, mainCanvas) {
        _this.setState({
          cropperVisibleStyle: { display: cropper },
          mainCanvasVisibleStyle: { display: mainCanvas }
        });
      }
      
      isToggled ? this.setStyle("inline-block", "none") : this.setStyle("none", "inline-block");
    }


    cropImg = () => {
      if (this.editor) {
        const canvas = this.editor.getImageScaledToCanvas();
        this.setState({
            imgCropData: canvas.toDataURL(),
            isFileChooserDisabled: true,
            isToolsDisabled: true
        });
        this.toggleCropper(true);
      }
    }


    completeCrop(croppedImg, imgSize)
    {
      this.setState({
        imgData: croppedImg,
        scaleFactor: 1,
        rotateValue: 0,
        editorWidth: imgSize.width,
        editorHeight: imgSize.height,
        isEditorSizeChanged: true,
        isFileChooserDisabled: false,
        imageEditorWrapperStyle: {
          width: imgSize.width,
          margin: '0 auto'
        },
        isToolsDisabled: false
      });
      this.toggleCropper(false);
    }


    downloadImg = () =>
    {
      if (this.editor) {
        canvasToImage('imageEditor', {
          name: 'Image',
          type: 'jpg',
          quality: 1
        });
      }
    }



    setEditorRef = (editor) => this.editor = editor
    render()
    {
        return (
            <div className="imageEditorContainer" ref="imageEditorContainer">
            
                <div className="imageEditor">
                    <div style={this.state.imageEditorWrapperStyle}>
                        <AvatarEditor
                            id="imageEditor"
                            className="canvas"
                            style={this.state.mainCanvasVisibleStyle}
                            ref={this.setEditorRef}
                            image={this.state.imgData}
                            width={this.state.editorWidth}
                            height={this.state.editorHeight}
                            border={0}
                            color={[255, 255, 255, 0.6]} // RGBA
                            scale={this.state.scaleFactor}
                            rotate={this.state.rotateValue}
                        />
                    </div>               
                </div>
            
                <div className="imageEditor" style={this.state.cropperVisibleStyle}>
                  <div style={this.state.imageEditorWrapperStyle}>
                    <div className="canvas">
                        <Cropper 
                          imgData={this.state.imgCropData} 
                          completeCrop={(croppedImg, imgSize) => { this.completeCrop(croppedImg, imgSize) }}  
                          enableTools={() => {this.setState({isToolsDisabled: false}); this.setState({isFileChooserDisabled: false});}} 
                          toggleCropper={(isToggled) => {this.toggleCropper(isToggled)}}
                      />
                    </div>
                  </div>
                </div>


                <div className="sideBar">
                  <div className="editorOptions">
                      <div className="imageOption">
                          <Label htmlFor="fileBrowser"> Upload Image </Label> 
                          <input type="file" className="inputs" ref="fileBrowser" id="fileBrowser" onChange={this.loadFile} style={{display: 'inline-block'}} disabled={this.state.isFileChooserDisabled}/>
                      </div>

                      <div className="imageOption">
                          <Label htmlFor="crop"> Crop </Label> 
                          <Button type="button" id="crop" className="buttons" style={{ display: 'inline-block' }} disabled={this.state.isToolsDisabled} onClick={this.cropImg} > Crop </Button>
                      </div>

                      <div className="imageOption">
                          <Label htmlFor="rotateTxt"> Rotate </Label> 
                          <input type="number" id="rotateTxt" className="inputs" ref="rotationTxt" disabled={this.state.isToolsDisabled}/>
                          <Button type="button" className="buttons" onClick={(degrees) => { this.setRotateFromTxt() }} style={{ display: 'inline-block' }}  disabled={this.state.isToolsDisabled}> Rotate </Button>
                      </div>

                      <div className="imageOption">
                        <RotateSlider setValue={this.setRotateValue} text={"Rotate Image"} display={this.state.isToolsDisabled}/>
                      </div>

                      <div className="imageOption">
                          <Label htmlFor="resize"> Resize </Label> 
                          <Button type="button" id="resize" className="buttons" onClick={() => this.resizeImage(-1)} style={{ display: 'inline-block' }}  disabled={this.state.isToolsDisabled}> - </Button>
                          <Button type="button" className="buttons" onClick={() => this.resizeImage(1)} style={{ display: 'inline-block' }}  disabled={this.state.isToolsDisabled}> + </Button>
                      </div>

                      <div className="imageOption">
                          <Label htmlFor="download"> Download Image </Label>
                          <a id="download" ref="downloadBtn" onClick={this.downloadImg}>  <Button className="buttons" disabled={this.state.isToolsDisabled}> Download Image </Button> </a>
                      </div>

                      <div className="imageOption">
                          <Button type="reset" className="buttons"  onClick={this.resetEditor} disabled={this.state.isToolsDisabled}>Reset</Button>
                      </div>
                  </div>
                </div>

            </div>

        );

    }



}

export default ImageEditor;