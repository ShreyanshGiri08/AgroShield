import React, { useState } from 'react';
import { analyzeCropPhoto } from '../services/api';
import { Camera, Upload, CheckCircle, Sparkles, ShieldAlert } from 'lucide-react';
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
      alert(language === 'hi' ? 'चित्र विश्लेषण में त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Image inspection failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-sand-light/50 border border-sand/80 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-sand/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-peach/40 flex items-center justify-center text-coffee">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-coffee">
              {language === 'hi' ? 'मल्टीमॉडल फसल स्वास्थ्य जांच' : 'Multimodal Crop Health Clinic'}
            </h3>
            <p className="text-xs text-pitch/60">
              {language === 'hi' ? 'पत्ती या पौधे की फोटो खींचकर लक्षण पहचानें' : 'Upload photo of leaf/plant for visible symptom analysis'}
            </p>
          </div>
        </div>
        <span className="bg-peach/30 border border-peach text-coffee text-[10px] font-bold px-2.5 py-1 rounded-full">
          Gemini 3.5 Vision
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {/* Left: Upload and Preview Box */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-sand hover:border-peach rounded-2xl p-6 text-center bg-cornsilk/80 transition flex flex-col items-center justify-center min-h-[260px] relative">
            {previewUrl ? (
              <div className="space-y-3 w-full">
                <img
                  src={previewUrl}
                  alt="Crop Preview"
                  className="max-h-56 mx-auto rounded-xl object-contain border border-sand shadow-sm"
                />
                <p className="text-[11px] text-pitch/60">{selectedFile?.name}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-full bg-sand/60 flex items-center justify-center mx-auto text-coffee">
                  <Upload className="w-6 h-6 text-peach-dark" />
                </div>
                <div>
                  <p className="text-sm font-bold text-coffee">
                    {language === 'hi' ? 'पौधे या पत्ती की फोटो चुनें' : 'Upload crop or leaf photo'}
                  </p>
                  <p className="text-xs text-pitch/50 mt-1">JPEG, PNG या WebP प्रारूप (अधिकतम 5MB)</p>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <button
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || isAnalyzing}
            className="w-full bg-peach hover:bg-peach-dark disabled:opacity-40 text-coffee font-black py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-sm text-sm"
          >
            {isAnalyzing ? (
              <>
                <FarmarianMascot state="thinking" size={24} />
                <span className="animate-pulse">
                  {language === 'hi' ? 'लक्षणों की जांच कर रहा हूँ...' : 'Inspecting plant abnormalities...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-coffee" />
                <span>{language === 'hi' ? 'AI फसल जांच प्रारंभ करें' : 'Start AI Inspection'}</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Analysis Results */}
        <div className="bg-cornsilk border border-sand/80 rounded-2xl p-5 flex flex-col justify-between">
          {analysisResult ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pitch/50 block mb-1">
                  पहचाने गए लक्षण (Observed Symptoms)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.visible_symptoms?.map((sym: string, sIdx: number) => (
                    <span
                      key={sIdx}
                      className="bg-sand text-coffee text-xs font-bold px-2.5 py-1 rounded-lg border border-sand-dark"
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              </div>

              {/* Possible Causes */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pitch/50 block mb-1">
                  संभावित कारण (Possible Causes)
                </span>
                <div className="space-y-2">
                  {analysisResult.possible_causes?.map((c: any, cIdx: number) => (
                    <div key={cIdx} className="bg-sand/20 border border-sand/50 rounded-xl p-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-coffee">{c.cause}</span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            c.likelihood === 'HIGH'
                              ? 'bg-peach text-coffee'
                              : 'bg-sand text-pitch/70'
                          }`}
                        >
                          संभावना: {c.likelihood}
                        </span>
                      </div>
                      <p className="text-pitch/80 mt-1">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Precautions */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pitch/50 block mb-1">
                  प्राथमिक सावधानियां (Precautions)
                </span>
                <ul className="space-y-1 text-xs text-pitch/80">
                  {analysisResult.recommended_precautions?.map((p: string, pIdx: number) => (
                    <li key={pIdx} className="flex items-start space-x-2">
                      <CheckCircle className="w-3.5 h-3.5 text-agri-safe flex-shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Uncertainty Disclaimer */}
              <div className="p-3 bg-agri-danger/5 border border-agri-danger/20 rounded-xl text-[10px] text-agri-danger font-medium flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-agri-danger flex-shrink-0 mt-0.5" />
                <span>{analysisResult.uncertainty_disclaimer}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3 text-pitch/50">
              <FarmarianMascot state="welcoming" size={54} />
              <p className="text-xs max-w-xs">
                {language === 'hi'
                  ? 'अपनी फसल या पत्ती की स्पष्ट फोटो अपलोड करें। फार्मरियन दृश्य लक्षणों की वैज्ञानिक जांच करेगा।'
                  : 'Take a clear photograph of damaged leaves or pests to identify symptoms and safe precautions.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
