import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import PrivacyPolicy from './privacy-policy';
import './App.css';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState('');
  const [printType, setPrintType] = useState('وجه واحد');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState(0);
  const [pages, setPages] = useState(0);
  const [finalPages, setFinalPages] = useState(0);

  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const onSuccess = (res) => {
    setIsLoggedIn(true);
    setAccessToken(res.tokenObj.access_token);
    alert("تم تسجيل الدخول بنجاح");
  };

  const onFailure = () => {
    alert("فشل تسجيل الدخول");
  };
  



  
  const uploadToDrive = async () => {
    if (!file || !accessToken) {
      alert("الرجاء التأكد من تحديد الملف وتسجيل الدخول أولاً");
      return;
    }

    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: ["1_VK1V851ySGZr6EMaw0beonwkIPj-QwJ"]
    };

    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", file);

    try {
      const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: new Headers({ Authorization: "Bearer " + accessToken }),
        body: form
      });
      
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error details:", errorResponse);
        alert("حدث خطأ أثناء رفع الملف");
      } else {
        alert("تم رفع الملف إلى Google Drive بنجاح");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("حدث خطأ أثناء رفع الملف");
    }
  };

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
      ^_^
      <img src="/logo.png" alt="Logo" style={{ width: '120px', margin: '0 auto 20px', display: 'block' }} />
      <h1>طلب طباعة</h1>

      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <GoogleLogin
          clientId={CLIENT_ID}
          buttonText="تسجيل الدخول بـ Google"
          onSuccess={onSuccess}
          onFailure={onFailure}
          cookiePolicy={'single_host_origin'}
          scope="https://www.googleapis.com/auth/drive.file"
        />
      </div>

      <input type="file" accept="application/pdf" multiple onChange={handleFileChange} /><br /><br />
      

      <label>اختر نوع الطباعة:</label>
      <select onChange={handlePrintTypeChange}>
        <option value="وجه واحد">وجه واحد</option>
        <option value="وجهين">وجهين</option>
      </select><br /><br />

      <label>اختر الجودة:</label>
      <select onChange={handleQualityChange}>
        <option value="متوسطة">متوسطة</option>
        <option value="ممتازة">ممتازة</option>
      </select><br /><br />

      <input type="text" placeholder="الاسم" onChange={(e) => setName(e.target.value)} /><br /><br />
      <input type="text" placeholder="رقم الهاتف" onChange={(e) => setPhone(e.target.value)} /><br /><br />
      <input type="text" placeholder="العنوان" onChange={(e) => setAddress(e.target.value)} /><br /><br />
      <p>عدد الصفحات في الملفات: {pages}</p>
      <p>عدد الصفحات المطلوبة للطباعة: {finalPages}</p>
      <p>السعر الكلي: {price.toFixed(0)} دينار</p>
      
      <button onClick={uploadToDrive}>رفع الملف إلى Google Drive</button><br /><br />
      <button onClick={handleSendTelegram}>إرسال الطلب إلى التليغرام</button>
      <br /><br />
      <Link to="/privacy-policy">سياسة الخصوصية</Link>
    </div>
    
  );
}

function App() {
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;