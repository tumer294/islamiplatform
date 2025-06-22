import React, { useState, useRef } from 'react';
import { Image, Smile, MapPin, Calendar, X, Upload, Video, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePosts } from '../hooks/usePosts';

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { createPost } = usePosts();
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [category, setCategory] = useState('Genel');
  const [tags, setTags] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Genel', 'Hadis', 'Dua', 'Sohbet', 'Eğitim', 'Duyuru', 'Ramazan', 'Hac', 'Umre'];
  
  const emojis = ['🤲', '☪️', '🕌', '📿', '📖', '🌙', '⭐', '💫', '🌟', '✨', '🙏', '❤️', '💚', '🤍', '🌹', '🌺', '🌸', '🌼', '🌻', '🌷'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedMedia) return;

    setLoading(true);
    
    try {
      let mediaUrl = null;
      let postType: 'text' | 'image' | 'video' = 'text';

      if (selectedMedia) {
        // Gerçek uygulamada burada dosya yükleme servisi kullanılır
        // Şimdilik base64 olarak saklayacağız (demo amaçlı)
        mediaUrl = mediaPreview;
        postType = mediaType || 'text';
      }

      const postContent = location ? `${content}\n📍 ${location}` : content;
      const postTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      const { error } = await createPost(postContent, postType, mediaUrl, category, postTags);
      
      if (!error) {
        setContent('');
        setSelectedMedia(null);
        setMediaPreview(null);
        setMediaType(null);
        setLocation('');
        setShowLocationInput(false);
        setCategory('Genel');
        setTags('');
        setIsExpanded(false);
        
        // Sayfa yenileme
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Gönderi oluşturma hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Dosya boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }

    setSelectedMedia(file);
    setMediaType(type);

    // Önizleme oluştur
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const insertEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Gerçek uygulamada reverse geocoding API kullanılır
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          setShowLocationInput(true);
        },
        (error) => {
          console.error('Konum alınamadı:', error);
          setShowLocationInput(true);
        }
      );
    } else {
      setShowLocationInput(true);
    }
  };

  if (!user) return null;

  return (
    <div className={`
      rounded-xl p-6 mb-6 border transition-all duration-300
      ${theme === 'islamic' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
        theme === 'ramadan' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
        'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }
    `}>
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4">
          <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-lg">
              {user.name?.[0] || user.email?.[0]?.toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="Neler düşünüyorsun?"
              className={`
                w-full p-3 rounded-lg border resize-none transition-all duration-200
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${theme === 'islamic' ? 'bg-white dark:bg-emerald-800 border-emerald-300 dark:border-emerald-600' :
                  theme === 'ramadan' ? 'bg-white dark:bg-yellow-800 border-yellow-300 dark:border-yellow-600' :
                  'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                }
                text-gray-900 dark:text-white placeholder-gray-500
              `}
              rows={isExpanded ? 4 : 2}
              disabled={loading}
            />

            {/* Media Preview */}
            {mediaPreview && (
              <div className="mt-3 relative">
                {mediaType === 'image' ? (
                  <img 
                    src={mediaPreview} 
                    alt="Önizleme" 
                    className="max-h-64 rounded-lg object-cover"
                  />
                ) : (
                  <video 
                    src={mediaPreview} 
                    controls 
                    className="max-h-64 rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Location Input */}
            {showLocationInput && (
              <div className="mt-3">
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-gray-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Konum ekle..."
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocationInput(false)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
            
            {isExpanded && (
              <div className="mt-4 animate-slide-up space-y-4">
                {/* Category and Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kategori
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Etiketler
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="etiket1, etiket2"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-10 gap-2">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => insertEmoji(emoji)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Photo Upload */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      <Image size={18} />
                      <span className="hidden sm:inline">Fotoğraf</span>
                    </button>

                    {/* Video Upload */}
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      <Video size={18} />
                      <span className="hidden sm:inline">Video</span>
                    </button>
                    
                    {/* Emoji Button */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      <Smile size={18} />
                      <span className="hidden sm:inline">Emoji</span>
                    </button>
                    
                    {/* Location Button */}
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      <MapPin size={18} />
                      <span className="hidden sm:inline">Konum</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExpanded(false);
                        setContent('');
                        setSelectedMedia(null);
                        setMediaPreview(null);
                        setLocation('');
                        setShowLocationInput(false);
                        setShowEmojiPicker(false);
                        setCategory('Genel');
                        setTags('');
                      }}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      disabled={loading}
                    >
                      İptal
                    </button>
                    
                    <button
                      type="submit"
                      disabled={(!content.trim() && !selectedMedia) || loading}
                      className={`
                        px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:shadow-md hover:scale-105
                        ${theme === 'islamic' ? 'bg-emerald-600 hover:bg-emerald-700' :
                          theme === 'ramadan' ? 'bg-yellow-600 hover:bg-yellow-700' :
                          'bg-primary-500 hover:bg-primary-600'
                        }
                        text-white
                      `}
                    >
                      {loading ? 'Paylaşılıyor...' : 'Paylaş'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, 'image')}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleFileSelect(e, 'video')}
          className="hidden"
        />
      </form>
    </div>
  );
};

export default CreatePost;