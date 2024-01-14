import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import QRCode from "react-qr-code";

function LabelsPrintout() {
  const title = 'Labels Generator';

  var labels = []

  const lbls = localStorage.getItem('labels');
  if(lbls){
    labels = JSON.parse(lbls)
  }else{
    localStorage.setItem('labels', JSON.stringify([]))
  }

  window.onload = function() { window.print(); }

  function makeid() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 7) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {labels.map((label) => {
        return(
          <div width="14cm" height="7cm" className='box-label box-label-1'>
            <table>
              <tr>
                <td><QRCode className='qrcode' level="H" value={label.id?label.id:makeid()}/></td>
                <td><h1>{label.label}</h1><h1>{label.label2}</h1></td>
              </tr>
            </table>
          </div>
        )
      })}
    </>
  );
}

export default LabelsPrintout;
