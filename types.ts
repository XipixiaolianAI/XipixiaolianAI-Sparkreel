

export enum UserLevel {
  BASIC = 'Basic',
  ELITE = 'Elite',
  CORE = 'Core'
}

export interface Transaction {
  id: string;
  type: 'recharge' | 'membership' | 'expenditure' | 'income';
  amount: number; // In CNY
  credits: number; // Credits change
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface User {
  id: string;
  uid: string; // Display ID
  name: string;
  avatar: string;
  level: UserLevel;
  credits: number;
  phone?: string;
  transactions: Transaction[];
  // New fields for Task Validation
  worksCount: number;
  rating: number;
}

export type TaskStatus = 'ongoing' | 'ended';

export interface TaskRequirements {
  minLevel: UserLevel;
  minWorksCount: number;
  minRating: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  priceRange: string; // e.g., "500-1000"
  currency: 'CNY'; 
  publishDate: string;
  deadline: string;
  acceptedCount: number;
  totalSlots: number;
  tags: string[];
  status: TaskStatus;
  requirements: TaskRequirements;
  contactWechat: string;
  isAcceptedByCurrentUser: boolean;
  descriptionImages?: string[]; // New field for images in description
}

// --- NEW STUDIO TYPES ---

export enum CreationMode {
  IMAGE_TO_VIDEO = '图生视频',
  FIRST_LAST_FRAME = '首尾帧视频',
  FUSION = '融合视频',
  SCRIPT_TO_VIDEO = '剧本生视频' // Added
}

export enum ShotType {
  DIALOGUE = '对话场景',
  CLOSE_UP = '特写画面',
  ACTION = '简单动作',
  INTERACTION = '交互镜头',
  FIGHT = '打斗场景',
  EMPTY = '空境画面'
}

export enum AiModel {
  WAN_2_5 = 'Wan 2.5 (万万2.5)',
  KLING = 'Kling AI (可灵)',
  RUNWAY = 'Runway Gen-3',
  SORA = 'Sora',
  MINIMAX = 'Minimax'
}

export interface Snippet {
  id: string;
  projectId: string;
  name: string;
  description: string;
  thumbnail?: string;
  status: 'Draft' | 'Generating' | 'Completed';
  mode?: CreationMode;
  createdAt: string;
  // Details for specific modes
  shotType?: ShotType;
  model?: AiModel;
  duration?: number;
}

export enum AssetCreationMode {
    MODEL_GEN = '通过模型生成',
    UPLOAD = '自己上传图片'
}

export interface Character {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  ageGroup: 'Child' | 'Teen' | 'Adult' | 'Elder';
  model: string;
  prompt: string;
  refImage?: string;
  previewImage?: string;
  creationMode: AssetCreationMode;
}

export interface Prop {
  id: string;
  name: string;
  model: string;
  prompt: string;
  refImage?: string;
  previewImage?: string;
  creationMode: AssetCreationMode;
}

export enum SceneType {
  MODEL_GEN = 'Model Generation',
  UPLOAD = 'Custom Upload'
}

export interface Scene {
  id: string;
  name: string;
  type: SceneType;
  model?: string;
  prompt?: string;
  image: string; // Gen result or upload
  creationMode: AssetCreationMode;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  lastModified: string;
  status: 'Draft' | 'Production' | 'Completed' | 'Published';
  progress: number;
  snippets: Snippet[]; 
  characters: Character[];
  props: Prop[];
  scenes: Scene[];
}

export enum ProjectTab {
  SEGMENTS = 'Segments',
  CHARACTERS = 'Characters',
  SCENES = 'Scenes',
  PROPS = 'Props',
  FUSION = 'Fusion',
  REPAINT = 'Repaint'
}

export interface WorkStats {
  id: string;
  title: string;
  views: number;
  collections: number; // likes/favorites
  rating: number; // 0-5
  adPerformance: number; // ROI %
}

export interface TaskHistoryItem {
  taskId: string;
  taskTitle: string;
  delivered: boolean;
  satisfaction: number; // 0-5
  completionDate: string;
}

export interface CreatorStats {
  projectsCreated: number;
  totalViews: number;
  roi: number; // Return on Investment percentage
  earnings: number;
  completionRate: number;
  works: WorkStats[];
  taskHistory: TaskHistoryItem[];
}

// --- TRAFFIC / INFLUENCER MARKETPLACE TYPES ---

export type SocialPlatform = 'YouTube' | 'TikTok' | 'Instagram' | 'Telegram' | 'Facebook';

export interface InfluencerChannel {
  id: string;
  name: string;
  description: string;
  avatar: string;
  platform: SocialPlatform;
  category: string; // e.g., 'Gaming', 'Crypto', 'Lifestyle'
  subscribers: number;
  avgViews: number;
  engagementRate: number; // %
  cpm: number; // Cost Per Mille
  price: number; // Flat price for a post/video in USD
  rating: number; // 0-5
  verified: boolean;
  language: string;
}

// --- HOME SUB-VIEWS TYPES ---

export interface Comic {
    id: string;
    title: string;
    cover: string;
    author: string;
    views: number;
    revenue: number;
    tags: string[];
    updatedAt: string;
    videoUrl: string; // For playback
}

export interface IpAsset {
    id: string;
    title: string;
    cover: string;
    author: string;
    platform: 'Qidian' | 'Tomato' | 'Jinjiang';
    price: number; // Credits
    tags: string[];
    description: string;
    isPurchased: boolean;
}

export interface Course {
    id: string;
    title: string;
    cover: string;
    type: 'Online' | 'Offline';
    level: UserLevel;
    status: 'Pending' | 'Ongoing' | 'Ended';
    instructor: string;
    date: string;
}

export interface CreatorNews {
    id: string;
    title: string;
    source: string;
    date: string;
    summary: string;
    image: string;
}

// --- SCRIPT TO VIDEO WORKFLOW TYPES ---

export enum WizardStep {
  SCRIPT = 1,
  ASSETS = 2,
  STORYBOARD = 3,
  FUSION = 4,
  VIDEO_EDIT = 5
}

export interface ScriptData {
  title: string;
  maxShots: number;
  content: string;
}

export interface Storyboard {
  id: string;
  sequence: number;
  scriptContent: string; // The text from the script
  prompt: string; // AI Generated image prompt
  assets: {
    characterIds: string[];
    sceneId: string | null;
    propIds: string[];
  };
  model: AiModel;
  aspectRatio: '16:9' | '9:16' | '1:1';
  count: number; // Number of images to gen
}

export interface FusionImage {
  id: string;
  storyboardId: string;
  imageUrl: string;
  prompt: string;
  videoModel: AiModel;
  resolution: '1080p' | '720p';
  duration: '5s' | '10s';
  count: number; // Number of videos to gen
  status: 'ready' | 'generating' | 'done';
  // New fields for advanced control
  aspectRatio: '16:9' | '9:16' | '1:1' | '2.35:1';
  assets: {
    characterIds: string[];
    sceneId: string | null;
    propIds: string[];
  };
  refPoseImage?: string;
  // The ID of the currently selected/confirmed video from the candidates
  confirmedVideoId?: string;
}

export interface FinalVideo {
  id: string;
  fusionImageId: string;
  videoUrl: string;
  prompt: string; // Video prompt
  dubbing?: {
    audioUrl: string;
    voice: string;
  };
}

export interface ScriptVideoState {
  step: WizardStep;
  script: ScriptData;
  selectedAssets: {
    characters: Character[];
    scenes: Scene[];
    props: Prop[];
  };
  storyboards: Storyboard[];
  fusionImages: FusionImage[];
  finalVideos: FinalVideo[];
}