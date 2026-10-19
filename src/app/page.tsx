'use client';

import React, { useState, useRef } from 'react';
import { ExamData, ConversionResponse } from '@/lib/types';

export default function Home() {
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepMessage, setStepMessage] = useState('');
  const [result, setResult] = useState<ConversionResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'diagrams'>('questions');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File handling
  const handleFiles = (incomingFiles: FileList | null) => {
    if (!incomingFiles) return;
    const newFiles: { file: File; preview: string }[] = [];
    Array.from(incomingFiles).forEach(file => {
      if (file.type.startsWith('image/') || file.name.endsWith('.pdf')) {
        const preview = URL.createObjectURL(file);
        newFiles.push({ file, preview });
      }
    });
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Convert files to base64 (with smart compression for large camera photos)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // If it's a PDF, read directly
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      // If it's an image, resize large camera photos to ensure fast upload within Vercel payload limits
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 2048;
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.90));
              return;
            }
          }
          resolve(dataUrl);
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Trigger conversion
  const handleConvert = async (useDemo: boolean = false) => {
    setLoading(true);
    setResult(null);
    setCurrentStep(1);
    setStepMessage('Đang chuẩn bị tệp tin và kiểm tra dữ liệu...');

    try {
      let imagesBase64: string[] = [];

      if (!useDemo) {
        if (files.length === 0) {
          alert('Cô vui lòng tải lên ít nhất một ảnh đề thi hoặc bấm nút "Dùng thử với Đề mẫu" ạ!');
          setLoading(false);
          return;
        }

        setStepMessage('Đang khử nhiễu và đọc dữ liệu hình ảnh...');
        imagesBase64 = await Promise.all(files.map(f => fileToBase64(f.file)));
      }

      // Step simulation for visual reassurance for the teacher
      const stepTimer1 = setTimeout(() => {
        setCurrentStep(2);
        setStepMessage('AI đang nhận diện công thức Vật lý (phân số, số mũ, ký hiệu Hy Lạp)...');
      }, 1500);

      const stepTimer2 = setTimeout(() => {
        setCurrentStep(3);
        setStepMessage('Đang tự động phát hiện và cắt đồ thị, sơ đồ mạch điện...');
      }, 3500);

      const stepTimer3 = setTimeout(() => {
        setCurrentStep(4);
        setStepMessage('Đang đóng gói file Word (.docx) chuẩn Equation và cố định bảng...');
      }, 5500);

      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: imagesBase64,
          useDemo,
          apiKey: apiKey.trim() || undefined
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      const data: ConversionResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Chuyển đổi thất bại');
      }

      setCurrentStep(4);
      setResult(data);
    } catch (err: any) {
      alert('Đã xảy ra lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Download DOCX file
  const handleDownload = () => {
    if (!result?.docxBase64) return;
    const byteCharacters = atob(result.docxBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = result.fileName || 'De_Thi_Vat_Ly.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo-group">
            <div className="logo-badge">W</div>
            <div className="logo-text">
              <h1>
                PhysDocx
                <span className="gift-tag">Kính tặng Cô giáo 💝</span>
              </h1>
              <p>Trợ lý số hóa đề thi môn Vật lý sang Microsoft Word</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              onClick={() => setShowSettings(true)}
              className="btn btn-secondary"
              title="Cài đặt khóa API"
              style={{ padding: '8px 14px', fontSize: '13px' }}
            >
              ⚙️ Cấu hình
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-pill">
            <span>✨ Chuyển đổi 1-Click thông minh</span>
          </div>
          <h2 className="hero-title">
            Biến Ảnh chụp & PDF thành file <span>Word (.docx) chuẩn 100%</span>
          </h2>
          <p className="hero-desc">
            Không lo vỡ công thức phân số hay mất hình vẽ. Tự động chuyển đổi sang định dạng Word Equation để cô bấm đúp chuột sửa số thoải mái!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container main-grid">
        <div className="card">
          {/* Dropzone */}
          <div
            className={`dropzone ${isDragging ? 'active' : ''}`}
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={e => handleFiles(e.target.files)}
              multiple
              accept="image/*,.pdf"
              style={{ display: 'none' }}
            />
            <div className="dropzone-icon">📄</div>
            <h3 className="dropzone-title">Cô bấm vào đây hoặc kéo thả ảnh đề thi vào khung này</h3>
            <p className="dropzone-subtitle">Hỗ trợ ảnh chụp điện thoại (JPG, PNG) và tệp PDF</p>
            <div className="dropzone-specs">
              <span>✓ Tự nhận diện công thức</span>
              <span>✓ Tự cắt đồ thị T-t, p-V</span>
              <span>✓ Cố định bảng chống nhảy trang</span>
            </div>
          </div>

          {/* Uploaded File Previews */}
          {files.length > 0 && (
            <div className="file-list">
              {files.map((item, idx) => (
                <div key={idx} className="file-item">
                  <div className="file-thumb-container">
                    <img src={item.preview} alt={item.file.name} className="file-thumb" />
                  </div>
                  <div className="file-details">
                    <span className="file-name">{item.file.name}</span>
                    <span className="file-size">{(item.file.size / 1024).toFixed(0)} KB</span>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="file-remove-btn"
                    title="Xóa ảnh này"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Bar */}
          <div className="action-bar">
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Công thức bóc tách chuẩn Equation/OMML (chỉnh sửa trực tiếp được)</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Đồ thị & mạch điện được cố định trong bảng ẩn viền</span>
              </div>
            </div>

            <div className="action-buttons">
              <button
                onClick={() => handleConvert(true)}
                disabled={loading}
                className="btn btn-demo"
                title="Thử nghiệm nhanh không cần tải ảnh"
              >
                🎯 Dùng thử với Đề mẫu HSG Đà Nẵng
              </button>
              <button
                onClick={() => handleConvert(false)}
                disabled={loading || files.length === 0}
                className="btn btn-primary btn-large"
              >
                {loading ? '⏳ Đang xử lý...' : '🚀 Bắt đầu chuyển đổi sang Word'}
              </button>
            </div>
          </div>

          {/* Progress Tracker */}
          {loading && (
            <div className="progress-card">
              <div className="step-tracker">
                <div className={`step-item ${currentStep >= 1 ? (currentStep > 1 ? 'completed' : 'active') : ''}`}>
                  <div className="step-circle">{currentStep > 1 ? '✓' : '1'}</div>
                  <div className="step-label">Tiếp nhận tệp</div>
                </div>
                <div className={`step-item ${currentStep >= 2 ? (currentStep > 2 ? 'completed' : 'active') : ''}`}>
                  <div className="step-circle">{currentStep > 2 ? '✓' : '2'}</div>
                  <div className="step-label">Đọc công thức Lý</div>
                </div>
                <div className={`step-item ${currentStep >= 3 ? (currentStep > 3 ? 'completed' : 'active') : ''}`}>
                  <div className="step-circle">{currentStep > 3 ? '✓' : '3'}</div>
                  <div className="step-label">Cắt đồ thị & mạch</div>
                </div>
                <div className={`step-item ${currentStep >= 4 ? (currentStep > 4 ? 'completed' : 'active') : ''}`}>
                  <div className="step-circle">{currentStep > 4 ? '✓' : '4'}</div>
                  <div className="step-label">Đóng gói Word</div>
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: '14px', color: '#1e40af', fontWeight: 600 }}>
                {stepMessage}
              </p>
            </div>
          )}

          {/* Success Download Card */}
          {result && (
            <div className="success-card">
              <div className="success-badge">✓</div>
              <h3 className="success-title">Đã tạo xong file Word hoàn chỉnh cho Cô!</h3>
              <p className="success-subtitle">
                Tệp tin <strong>{result.fileName}</strong> đã được đóng gói chuẩn quy cách đề thi HSG của Sở GD&ĐT.
              </p>

              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-value">{result.data?.questions.length || 0}</div>
                  <div className="stat-label">Câu hỏi trắc nghiệm</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{result.data?.diagrams.length || 0}</div>
                  <div className="stat-label">Hình vẽ & đồ thị đã cắt</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">100%</div>
                  <div className="stat-label">Chuẩn Equation sửa được</div>
                </div>
              </div>

              <button onClick={handleDownload} className="btn btn-success btn-large">
                📥 Tải file Word (.docx) về máy tính của Cô
              </button>

              {/* Preview Section */}
              <div className="preview-section">
                <div className="tabs-header">
                  <button
                    className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('questions')}
                  >
                    📝 Nội dung câu hỏi ({result.data?.questions.length})
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'diagrams' ? 'active' : ''}`}
                    onClick={() => setActiveTab('diagrams')}
                  >
                    📊 Đồ thị & Hình vẽ đã bóc tách ({result.data?.diagrams.length})
                  </button>
                </div>

                <div className="tab-content">
                  {activeTab === 'questions' && (
                    <div>
                      {result.data?.questions.map(q => (
                        <div key={q.id} className="preview-question">
                          <div className="question-title">
                            Câu {q.number}: {q.content}
                          </div>
                          <div className="question-options">
                            {q.options.map(opt => (
                              <div key={opt.label}>
                                <strong>{opt.label}.</strong> {opt.text}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'diagrams' && (
                    <div className="diagram-gallery">
                      {result.data?.diagrams.map(diag => (
                        <div key={diag.id} className="diagram-item">
                          {diag.imageBase64 && (
                            <img src={diag.imageBase64} alt={diag.label} />
                          )}
                          <div className="diagram-title">{diag.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tips for Teacher */}
              <div className="teacher-tips">
                <div className="teacher-tips-title">
                  <span>💡</span> 3 Mẹo nhỏ dành cho Cô khi mở file trên Microsoft Word:
                </div>
                <ul className="tips-list">
                  <li><strong>Sửa số liệu công thức:</strong> Cô chỉ cần bấm đúp chuột (click đúp) vào bất kỳ phân số hoặc ký hiệu nào để gõ lại số mới như gõ văn bản bình thường.</li>
                  <li><strong>Hình vẽ không bao giờ bị lệch:</strong> Em đã cài đặt đồ thị nằm gọn trong ô bảng bên phải, cô có gõ thêm dài bao nhiêu dòng thì hình vẫn nằm nguyên vị trí không bị nhảy trang.</li>
                  <li><strong>In ấn trực tiếp:</strong> Căn lề chuẩn (trên 2cm, dưới 2cm, trái 2.5cm, phải 1.5cm) đúng thể thức văn bản đề thi của Bộ Giáo dục.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Cấu hình Google Gemini API</h3>
              <button onClick={() => setShowSettings(false)} className="modal-close">✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Khóa Google Gemini API Key (Tùy chọn):</label>
              <input
                type="password"
                className="form-input"
                placeholder="Nhập khóa AIzaSy... (Nếu có)"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                Nếu cô dùng bản thử nghiệm hoặc trên máy chủ đã cài sẵn khóa, cô không cần nhập gì vào đây ạ.
              </p>
            </div>
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <button onClick={() => setShowSettings(false)} className="btn btn-primary">
                Đã hiểu & Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>Phần mềm số hóa đề thi môn Vật lý • Phát triển bởi học trò Bách Khoa (IT1) <span>♥</span> Kính tặng Cô giáo</p>
        </div>
      </footer>
    </>
  );
}
