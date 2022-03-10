import React, { Component } from 'react';
import ReactDOM from "react-dom";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Button from '@govuk-react/button';


class Cropper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgWidth: 0,
      crop: {
        x: 20,
        y: 10,
        width: 30,
        height: 10
      },
      croppedAreaPixels: null,
      croppedImage: null,
      canvasWidth: 800,
      canvasHeight: 400,
      cropOptionsStyle: {
        display: 'inline-block',
        fontSize: '16pt',
        margin: '5px'
      },
      cropSubmitDisabled: true
    };
  }



  onComplete = (croppedArea, croppedAreaPixels) => {
    this.setState({ croppedAreaPixels });
    this.setState({cropSubmitDisabled: false});
  }
  
  
  performCrop = () => 
  {
    let _this = this;
    this.setState({cropSubmitDisabled: true});
    let croppedAreaPixels = this.state.croppedAreaPixels;
    const canvas = this.refs.canvas;
    
    this.state.canvasWidth = croppedAreaPixels.width;
    this.state.canvasHeight = croppedAreaPixels.height;
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    
    const context = canvas.getContext("2d");
    var image = new Image();
    image.onload = function () {
      context.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);
      _this.props.completeCrop(canvas.toDataURL(), { width: croppedAreaPixels.width, height: croppedAreaPixels.height});
    };
    image.src = this.props.imgData;
  }
  
  
  cancelCrop = () => {
    this.props.toggleCropper(false);
    this.props.enableTools();
  }



  onCropChange = crop => {
    this.setState({ crop });
  }
  
  setImgWidth = () =>
  {
    let _this = this;
    var image = new Image();
    image.onload = function () {
      _this.setState({imgWidth: image.width});
    };
    image.src = this.props.imgData;
  }

  render() 
  {
    return (
      <div>
        <div>
          <Button type="button" id="cropSubmit" className="buttons" style={this.state.cropOptionsStyle} ref="cropSubmit" onClick={this.performCrop} disabled={this.state.cropSubmitDisabled} > &#10004; </Button>
          <Button type="button" id="cropCancel" className="buttons" style={this.state.cropOptionsStyle} ref="cropCancel" onClick={this.cancelCrop} > &#x2716; </Button>
        </div>
        <ReactCrop
          src={this.props.imgData}
          crop={this.state.crop}
          onChange={this.onCropChange}
          onComplete={this.onComplete}
          onImageLoaded={this.setImgWidth}  
        />        
        <img src="" width={this.state.imgWidth} style={{border: "1px solid blue"}}/>{ /*this allows react-crop to resize to the size of the image being passed as props - unknown reason*/}
        <canvas ref="canvas" width={this.state.canvasWidth} height={this.state.canvasHeight} style={{display: 'none'}}> </canvas>
      </div>
    );
  }

}
export default Cropper;