import React, { useState } from 'react';
import './App.css';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

function App() {
  const [quality, setQuality] = useState('');
  const [printType, setPrintType] = useState('وجه واحد');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState(0);
  const [pages, setPages] = useState(0);
  const [finalPages, setFinalPages] = useState(0);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    let totalPages = 0;

    for (let file of files) {
      if (file && file.type === "application/pdf") {
        const reader = new FileReader();
        const fileLoadPromise = new Promise((resolve) => {
          reader.onload = async function () {
            const typedarray = new Uint8Array(reader.result);
            const pdf = await getDocument({ data: typedarray }).promise;
            totalPages += pdf.numPages;
            resolve();
          };
        });
        reader.readAsArrayBuffer(file);
        await fileLoadPromise;
      }
    }

    setPages(totalPages);

    let actualPages = printType === 'وجهين' ? Math.ceil(totalPages / 2) : totalPages;
    setFinalPages(actualPages);

    if (quality === 'متوسطة') {
      setPrice(actualPages * 75);
    } else if (quality === 'ممتازة') {
      setPrice(actualPages * 125);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;
          setLocation(mapLink);
          alert('تم تحديد الموقع بنجاح');
        },
        () => {
          alert('فشل في تحديد الموقع');
        }
      );
    } else {
      alert('المتصفح لا يدعم تحديد الموقع');
    }
  };


  const handleQualityChange = (e) => {
    const selected = e.target.value;
    setQuality(selected);
    let actualPages = printType === 'وجهين' ? Math.ceil(pages / 2) : pages;
    setFinalPages(actualPages);

    if (selected === 'متوسطة') {
      setPrice(actualPages * 75);
    } else if (selected === 'ممتازة') {
      setPrice(actualPages * 125);
    }
  };

  const handlePrintTypeChange = (e) => {
    const selected = e.target.value;
    setPrintType(selected);
    let actualPages = selected === 'وجهين' ? Math.ceil(pages / 2) : pages;
    setFinalPages(actualPages);

    if (quality === 'متوسطة') {
      setPrice(actualPages * 75);
    } else if (quality === 'ممتازة') {
      setPrice(actualPages * 125);
    }
  };

  const handleSendTelegram = () => {
    const message =
      `الاسم: ${name} | الهاتف: ${phone} | الجودة: ${quality} | الطباعة: ${printType} | الصفحات: ${pages} | الصفحات المحسوبة: ${finalPages} | السعر: ${price.toFixed(0)} دينار | العنوان: ${address}`;
    const encodedMessage = encodeURIComponent(message);
    const telegramUsername = 'ALHSAM2';
    const telegramUrl = `https://t.me/${telegramUsername}?text=${encodedMessage}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <div className="App">
      
      <img src="/logo.png" alt="Logo" style={{ width: '120px', margin: '0 auto 20px', display: 'block' }} />
      <h1>طلب طباعة</h1>
      <input type="file" accept="application/pdf" multiple onChange={handleFileChange} /><br /><br />

      <label>اختر نوع الطباعة:</label>
      <select onChange={handlePrintTypeChange}>
        <option value="وجه واحد">وجه واحد</option>
        <option value="وجهين">وجهين</option>
      </select><br /><br />

      <label>اختر الجودة:</label>
      <select onChange={handleQualityChange}>
        <option value="">-- اختر --</option>
        <option value="متوسطة">متوسطة</option>
        <option value="ممتازة">ممتازة</option>
      </select><br /><br />

      <input type="text" placeholder="الاسم" onChange={(e) => setName(e.target.value)} /><br /><br />
      <input type="text" placeholder="رقم الهاتف" onChange={(e) => setPhone(e.target.value)} /><br /><br />
      <input type="text" placeholder="العنوان" onChange={(e) => setAddress(e.target.value)} /><br /><br />
      <button onClick={getLocation}>تحديد موقعي الحالي</button><br /><br />


      <p>عدد الصفحات في الملفات: {pages}</p>
      <p>عدد الصفحات المطلوبة للطباعة: {finalPages}</p>
      <p>السعر الكلي: {price.toFixed(0)} دينار</p>

      <button onClick={handleSendTelegram}>إرسال الطلب إلى التليغرام</button>
    </div>
  );
}

export default App;
