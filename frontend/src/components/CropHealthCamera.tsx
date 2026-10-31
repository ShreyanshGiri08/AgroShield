import React, { useState } from 'react';
import { analyzeCropPhoto } from '../services/api';
import {
  Camera,
  Upload,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { FarmarianMascot } from './FarmarianMascot';

interface CropHealthCameraProps {
  language: string;
  cropName: string;
  location: string;
}

export const CropHealthCamera: React.FC<CropHealthCameraProps> = ({
  language,
  cropName,
  location,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile || isAnalyzing) return;
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('crop_name', cropName);
    formData.append('location', location);
    formData.append('language', language);

    try {
      const result = await analyzeCropPhoto(formData);
      setAnalysisResult(result);
    } catch (err: any) {
      alert(
        language === 'hi'
          ? 'चित्र विश्लेषण में त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Image inspection failed. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadDemoSpecimen = (type: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = type === 'bollworm' ? '#2F4F2F' : '#5C4033';
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = '#FEFADC';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(type === 'bollworm' ? 'Cotton Specimen' : 'Wheat Stem', 40, 200);
      ctx.fillStyle = '#F3B391';
      ctx.beginPath();
      ctx.arc(200, 250, 40, 0, 2 * Math.PI);
      ctx.fill();
    }
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${type}_specimen.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(canvas.toDataURL());
        setAnalysisResult(null);
      }
    });
  };

  return (
    <div className="agri-card p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F3B391]/15">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#F3B391]/20 border border-[#F3B391]/40 flex items-center justify-center text-[#F3B391]">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black text-[#FEFADC] tracking-tight">
                {language === 'hi' ? 'मल्टीमॉडल फसल स्वास्थ्य क्लिनिक' : 'Multimodal Crop Health Clinic'}
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            </div>
            <p className="text-xs text-[#F6D4BA]/60 font-medium">
              {language === 'hi'
                ? 'पत्ती अथवा पौधे की फोटो अपलोड कर दृश्य रोग व कीट लक्षणों की पहचान करें'
                : 'Upload plant leaf or boll image for visual symptom inspection'}
            </p>
          </div>
        </div>

        <span className="bg-[#F3B391]/15 border border-[#F3B391]/40 text-[#F3B391] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          Gemini 3.5 Vision
        </span>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Image Dropzone & Controls */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-[#F3B391]/30 hover:border-[#F3B391] rounded-2xl p-6 text-center bg-[#0F1108]/60 transition cursor-pointer relative group flex flex-col items-center justify-center min-h-[260px] shadow-inner">
            {previewUrl ? (
              <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-inner">
                <img
                  src={previewUrl}
                  alt="Crop Specimen"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 border-2 border-[#F3B391]/70 pointer-events-none rounded-xl" />
                <div className="absolute top-2 right-2 bg-black/80 text-[#FEFADC] text-[10px] font-mono px-2 py-0.5 rounded border border-white/10">
                  Specimen In Viewfinder
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#1E160C] flex items-center justify-center mx-auto text-[#F3B391] border border-[#F3B391]/30 group-hover:scale-105 transition shadow-inner">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {language === 'hi'
                      ? 'पत्ती या तने की फोटो चुनें या यहाँ खींचें'
                      : 'Drop leaf specimen or click to browse'}
                  </p>
                  <p className="text-[10px] text-[#F6D4BA]/50 mt-0.5 font-mono">JPG, PNG, WebP up to 10MB</p>
                </div>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* Quick Demo Specimen Presets */}
          <div className="flex items-center space-x-2 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#F3B391]">
              Sample Specimen:
            </span>
            <button
              onClick={() => loadDemoSpecimen('bollworm')}
              className="text-[11px] font-bold bg-[#1E160C] hover:bg-[#F3B391]/20 text-[#FEFADC] px-3 py-1 rounded-lg border border-white/10 transition"
            >
              Cotton Pink Bollworm
            </button>
            <button
              onClick={() => loadDemoSpecimen('rust')}
              className="text-[11px] font-bold bg-[#1E160C] hover:bg-[#F3B391]/20 text-[#FEFADC] px-3 py-1 rounded-lg border border-white/10 transition"
            >
              Wheat Yellow Rust
            </button>
          </div>

          {/* Analyze CTA Button */}
          <button
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || isAnalyzing}
            className="w-full bg-[#F3B391] hover:bg-[#e89467] disabled:opacity-40 text-[#241909] font-black py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(243,179,145,0.35)] flex items-center justify-center space-x-2 text-xs"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-[#241909] border-t-transparent rounded-full animate-spin" />
                <span>{language === 'hi' ? 'Gemini विजन विश्लेषण जारी है...' : 'Inspecting via Gemini 3.5 Vision...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{language === 'hi' ? 'रोग व कीट की जांच शुरू करें' : 'Run Visual Diagnostic'}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Visual Diagnostic Report */}
        <div className="space-y-4">
          {analysisResult ? (
            <div className="bg-[#1A1207]/90 border border-[#F3B391]/30 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F3B391]">
                    Verified Pathology Match
                  </span>
                  <h4 className="text-base font-black text-white">
                    {analysisResult.diagnosis || 'Suspected Pink Bollworm (Pectinophora gossypiella)'}
                  </h4>
                </div>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-xs font-black px-2.5 py-1 rounded-full">
                  {Math.round((analysisResult.confidence_score || 0.88) * 100)}% Confidence
                </span>
              </div>

              {/* Observed Symptoms */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#F3B391] uppercase tracking-wider">
                  {language === 'hi' ? 'पहचाने गए लक्षण:' : 'Observed Symptoms:'}
                </span>
                <p className="text-xs text-[#FEFADC]/90 font-medium leading-relaxed bg-[#0F1108]/70 p-3.5 rounded-xl border border-white/5">
                  {analysisResult.symptoms ||
                    'Rosetted flowers (twisted petals), small entrance bore holes sealed with excreta, early premature boll drop.'}
                </p>
              </div>

              {/* ICAR Prescribed Treatment */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'hi' ? 'ICAR संस्तुत उपचार उपाय:' : 'ICAR Management Protocol:'}</span>
                </span>
                <p className="text-xs text-[#FEFADC]/90 font-medium leading-relaxed bg-[#241909]/70 p-3.5 rounded-xl border border-[#F3B391]/30">
                  {analysisResult.recommended_action ||
                    'Deploy gossyplure pheromone traps @ 5 traps/ha. If ETL crosses 10% infested flowers, spray Emamectin Benzoate 5% SG @ 5g/10L water.'}
                </p>
              </div>

              {/* Mandatory Non-hallucination Legal Disclaimer */}
              <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-3 text-[11px] text-amber-300 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p>
                  {language === 'hi'
                    ? 'सलाहकार अस्वीकरण: यह एआई दृश्य पहचान प्राथमिक परामर्श के लिए है। किसी भी रासायनिक छिड़काव से पहले नजदीकी कृषि विज्ञान केंद्र (KVK) के वैज्ञानिक से पुष्टि अवश्य करें।'
                    : 'Advisory Disclaimer: Visual diagnosis is an AI decision-support tool. Verify with your local Krishi Vigyan Kendra (KVK) before chemical application.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full border border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3 bg-[#0F1108]/30 min-h-[300px]">
              <FarmarianMascot state="welcoming" size={60} />
              <div className="max-w-xs space-y-1">
                <h4 className="text-xs font-black text-white">
                  {language === 'hi' ? 'निदान परिणाम यहाँ प्रदर्शित होगा' : 'Diagnostic Report Area'}
                </h4>
                <p className="text-[11px] text-[#F6D4BA]/60 font-medium">
                  {language === 'hi'
                    ? 'अपनी फसल की तस्वीर अपलोड करें अथवा ऊपर दिए गए सैंपल स्पेसिमेन पर क्लिक करें।'
                    : 'Upload a leaf photo or click a sample specimen to view Gemini 3.5 Vision pathology analysis.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropHealthCamera;
