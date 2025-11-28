import React, { useState, useMemo, useRef } from 'react';
import { Icons } from './components/Icons';
import { 
  User, UserLevel, Task, Project, Snippet, CreationMode, ShotType, AiModel, 
  CreatorStats, ProjectTab, Character, Prop, Scene, InfluencerChannel, 
  Transaction, AssetCreationMode, SceneType, Comic, IpAsset, Course, CreatorNews,
  WizardStep, ScriptVideoState, Storyboard, FusionImage, FinalVideo, ScriptData
} from './types';
import { generateSceneImage, optimizeVideoPrompt } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// --- MOCK DATA & CONSTANTS ---

const MOCK_USER: User = {
  id: 'u1',
  uid: '8829304',
  name: '张三创作者',
  avatar: 'https://picsum.photos/id/64/100/100',
  level: UserLevel.ELITE,
  credits: 12500,
  transactions: [],
  worksCount: 12, // Added for validation
  rating: 4.8     // Added for validation
};

// ... Tasks Mock Data (Simplified for brevity, same as before) ...
const MOCK_TASKS: Task[] = [
  {
    id: 't1', title: '赛博朋克追逐戏 (30s)', description: '需要一个30秒的高燃追逐场景，科幻霓虹风格，用于短剧高潮部分。', creatorId: 'c1', creatorName: '星际工作室', creatorAvatar: 'https://picsum.photos/id/1/200/200', priceRange: '5000-8000', currency: 'CNY', publishDate: '2023-10-24', deadline: '2023-11-01', acceptedCount: 3, totalSlots: 5, tags: ['科幻', '动作', '3D渲染'], status: 'ongoing', requirements: { minLevel: UserLevel.ELITE, minWorksCount: 5, minRating: 4.5 }, contactWechat: 'cyber_studio_001', isAcceptedByCurrentUser: false
  },
  {
    id: 't2', title: '浪漫咖啡馆背景图', description: '为一部现代言情漫剧制作5张连贯的咖啡馆内部背景图。', creatorId: 'c2', creatorName: '甜叶漫画', creatorAvatar: 'https://picsum.photos/id/2/200/200', priceRange: '800-1200', currency: 'CNY', publishDate: '2023-10-20', deadline: '2023-10-25', acceptedCount: 1, totalSlots: 2, tags: ['浪漫', '背景', '2D手绘'], status: 'ongoing', requirements: { minLevel: UserLevel.BASIC, minWorksCount: 0, minRating: 4.0 }, contactWechat: 'sweet_leaf_art', isAcceptedByCurrentUser: true
  },
  { id: 't3', title: '古风武侠角色立绘', description: '需要设计3个核心反派角色的立绘，风格偏向水墨厚涂。', creatorId: 'c3', creatorName: '墨香阁', creatorAvatar: 'https://picsum.photos/id/3/200/200', priceRange: '2000-3000', currency: 'CNY', publishDate: '2023-10-26', deadline: '2023-11-05', acceptedCount: 0, totalSlots: 3, tags: ['古风', '立绘'], status: 'ongoing', requirements: { minLevel: UserLevel.ELITE, minWorksCount: 2, minRating: 4.2 }, contactWechat: 'moxiang', isAcceptedByCurrentUser: false },
  { id: 't4', title: '悬疑剧配乐定制', description: '10分钟悬疑短剧的背景音乐和音效设计。', creatorId: 'c4', creatorName: '声波工坊', creatorAvatar: 'https://picsum.photos/id/4/200/200', priceRange: '3000-4000', currency: 'CNY', publishDate: '2023-10-27', deadline: '2023-11-10', acceptedCount: 1, totalSlots: 1, tags: ['音乐', '音效'], status: 'ongoing', requirements: { minLevel: UserLevel.BASIC, minWorksCount: 1, minRating: 4.0 }, contactWechat: 'sound', isAcceptedByCurrentUser: false },
  { id: 't5', title: '3D角色绑定与动画', description: '提供模型，需要进行骨骼绑定并制作一套基础动作。', creatorId: 'c5', creatorName: '虚幻引擎', creatorAvatar: 'https://picsum.photos/id/5/200/200', priceRange: '4000-6000', currency: 'CNY', publishDate: '2023-10-28', deadline: '2023-11-15', acceptedCount: 2, totalSlots: 2, tags: ['3D', '动画'], status: 'ended', requirements: { minLevel: UserLevel.ELITE, minWorksCount: 3, minRating: 4.8 }, contactWechat: 'ue5', isAcceptedByCurrentUser: false },
  { id: 't6', title: '漫剧分镜脚本优化', description: '对现有的小说IP进行改编，输出适合AI视频生成的专业分镜脚本。', creatorId: 'c6', creatorName: '金牌编剧', creatorAvatar: 'https://picsum.photos/id/6/200/200', priceRange: '10000-15000', currency: 'CNY', publishDate: '2023-10-29', deadline: '2023-11-20', acceptedCount: 0, totalSlots: 1, tags: ['编剧', '脚本'], status: 'ongoing', requirements: { minLevel: UserLevel.CORE, minWorksCount: 10, minRating: 4.9 }, contactWechat: 'script', isAcceptedByCurrentUser: false }
];

const MOCK_PROJECTS: Project[] = [
  { 
    id: 'p1', title: '霓虹之夜 第一集', description: '赛博朋克风格短剧', cover: 'https://placehold.co/600x400/18181b/fbbf24?text=Neon+Night', lastModified: '2小时前', status: 'Production', progress: 65, 
    snippets: [
        { id: 's1', projectId: 'p1', name: '片段 1: 开场', description: '霓虹灯闪烁的街道空镜', status: 'Completed', createdAt: '2023-10-25', thumbnail: 'https://picsum.photos/id/101/300/169', mode: CreationMode.IMAGE_TO_VIDEO },
        { id: 's2', projectId: 'p1', name: '片段 2: 主角登场', description: '主角从阴影中走出', status: 'Draft', createdAt: '2023-10-26', mode: CreationMode.FUSION }
    ],
    characters: [
        { id: 'c1', name: 'Cyber Girl', gender: 'Female', ageGroup: 'Teen', model: 'Anime V4', prompt: 'Cyberpunk style girl', creationMode: AssetCreationMode.MODEL_GEN, previewImage: 'https://picsum.photos/id/64/100/100' },
        { id: 'c2', name: 'Old Hacker', gender: 'Male', ageGroup: 'Elder', model: 'Realism V2', prompt: 'Cyberpunk hacker old man', creationMode: AssetCreationMode.MODEL_GEN, previewImage: 'https://picsum.photos/id/65/100/100' }
    ],
    props: [
        { id: 'pr1', name: 'Laser Gun', model: 'Weapon V1', prompt: 'Red laser pistol', creationMode: AssetCreationMode.MODEL_GEN, previewImage: 'https://picsum.photos/id/70/100/100' }
    ],
    scenes: [
        { id: 'sc1', name: 'Neon Street', type: SceneType.MODEL_GEN, image: 'https://picsum.photos/id/80/100/100', creationMode: AssetCreationMode.MODEL_GEN }
    ]
  },
  { id: 'p2', title: '失落之剑', description: '奇幻冒险故事', cover: 'https://placehold.co/600x400/222/white?text=Lost+Sword', lastModified: '1天前', status: 'Draft', progress: 15, snippets: [], characters: [], props: [], scenes: [] },
  { id: 'p3', title: '校园日记', description: '青春校园日常', cover: 'https://placehold.co/600x400/333/pink?text=School+Diary', lastModified: '3天前', status: 'Published', progress: 100, snippets: [], characters: [], props: [], scenes: [] },
];

const MOCK_CHANNELS: InfluencerChannel[] = [
  { id: 'ch1', name: 'TechFuture', description: 'Deep dives into AI and future tech trends.', avatar: 'https://picsum.photos/id/50/100/100', platform: 'YouTube', category: 'Technology', subscribers: 1500000, avgViews: 450000, engagementRate: 8.5, cpm: 15, price: 3500, rating: 4.9, verified: true, language: 'English' },
  { id: 'ch2', name: 'CosplayQueen', description: 'Best cosplay transformation.', avatar: 'https://picsum.photos/id/64/100/100', platform: 'TikTok', category: 'Anime', subscribers: 2800000, avgViews: 1200000, engagementRate: 12.4, cpm: 5, price: 1800, rating: 4.7, verified: true, language: 'Japanese' },
  { id: 'ch3', name: 'GamerX', description: 'Hardcore gaming reviews.', avatar: 'https://picsum.photos/id/30/100/100', platform: 'YouTube', category: 'Gaming', subscribers: 800000, avgViews: 200000, engagementRate: 6.5, cpm: 12, price: 2000, rating: 4.5, verified: true, language: 'English' },
  { id: 'ch4', name: 'MovieRecap', description: 'Quick movie summaries.', avatar: 'https://picsum.photos/id/40/100/100', platform: 'Instagram', category: 'Entertainment', subscribers: 500000, avgViews: 300000, engagementRate: 5.5, cpm: 8, price: 1200, rating: 4.2, verified: false, language: 'English' },
];

const MOCK_STATS: CreatorStats = {
  projectsCreated: 42,
  totalViews: 158200,
  roi: 320,
  earnings: 45000,
  completionRate: 98,
  works: [
    { id: 'w1', title: '霓虹之夜 第一集', views: 52000, collections: 1200, rating: 4.8, adPerformance: 450 },
    { id: 'w2', title: '猫咪历险记', views: 88000, collections: 3400, rating: 4.9, adPerformance: 380 },
  ],
  taskHistory: [
    { taskId: 't101', taskTitle: '古风人物立绘设定', delivered: true, satisfaction: 5.0, completionDate: '2023-10-10' },
    { taskId: 't102', taskTitle: '30s 悬疑音效合成', delivered: true, satisfaction: 4.5, completionDate: '2023-09-28' },
  ]
};

// --- MOCK DATA FOR HOME SUB-PAGES ---
const MOCK_COMICS: Comic[] = [
    { 
        id: 'cm1', 
        title: '我挂机成了神', 
        cover: 'https://image.pollinations.ai/prompt/anime%20style%20key%20visual%20cover%20art%20young%20man%20glowing%20with%20divine%20golden%20power%20floating%20game%20ui%20screens%20fantasy%20background%20epic%20vivid%20colors?width=450&height=600&nologo=true', 
        author: '时刻互动', 
        views: 125000, 
        revenue: 52000, 
        tags: ['玄幻', '热血', '系统'], 
        updatedAt: '2小时前', 
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' 
    },
    { 
        id: 'cm2', 
        title: '管理员手册', 
        cover: 'https://image.pollinations.ai/prompt/anime%20style%20horror%20mystery%20cover%20art%20students%20in%20dark%20school%20corridor%20holding%20glowing%20book%20ghosts%20in%20shadows%20blue%20purple%20lighting?width=450&height=600&nologo=true', 
        author: 'FreeShort', 
        views: 98000, 
        revenue: 32000, 
        tags: ['惊悚', '校园', '悬疑'], 
        updatedAt: '4小时前', 
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' 
    },
    { 
        id: 'cm3', 
        title: '师尊踢我下山后，成了魔族天骄', 
        cover: 'https://image.pollinations.ai/prompt/anime%20style%20xianxia%20fantasy%20cover%20art%20handsome%20demon%20lord%20black%20wings%20ancient%20chinese%20clothes%20magical%20aura?width=450&height=600&nologo=true', 
        author: '时刻互动', 
        views: 158000, 
        revenue: 68000, 
        tags: ['仙侠', '魔道', '反转'], 
        updatedAt: '1天前', 
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' 
    },
    { 
        id: 'cm4', 
        title: '诡异收容所，你收容我一个人类？', 
        cover: 'https://image.pollinations.ai/prompt/anime%20style%20supernatural%20cover%20art%20young%20man%20standing%20calmly%20among%20eldritch%20monsters%20tentacles%20dark%20atmosphere%20containment%20cell?width=450&height=600&nologo=true', 
        author: 'FreeShort', 
        views: 85000, 
        revenue: 29000, 
        tags: ['都市', '异能', '克苏鲁'], 
        updatedAt: '2天前', 
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' 
    },
    { 
        id: 'cm5', 
        title: '你管这叫D级能力', 
        cover: 'https://image.pollinations.ai/prompt/anime%20style%20sci-fi%20action%20cover%20art%20protagonist%20unleashing%20massive%20energy%20blast%20destroying%20city%20shocked%20faces%20cyberpunk%20elements?width=450&height=600&nologo=true', 
        author: '时刻互动', 
        views: 210000, 
        revenue: 98000, 
        tags: ['科幻', '战斗', '爽文'], 
        updatedAt: '3天前', 
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' 
    },
    { 
        id: 'cm6', 
        title: '家族太无敌，系统黑化了', 
        cover: 'https://image.pollinations.ai/prompt/anime%20style%20fantasy%20group%20shot%20powerful%20family%20members%20dark%20corrupted%20system%20interface%20glitching%20background%20epic?width=450&height=600&nologo=true', 
        author: 'FreeShort', 
        views: 180000, 
        revenue: 75000, 
        tags: ['系统', '穿越', '群像'], 
        updatedAt: '1周前', 
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' 
    },
];

const MOCK_IPS: IpAsset[] = [
    { 
        id: 'ip1', 
        title: '斗罗大陆：重生', 
        cover: 'https://image.pollinations.ai/prompt/anime%20style%20fantasy%20cover%20martial%20arts%20soul%20spirit%20blue%20silver%20grass%20hammer%20epic%20battle?width=450&height=600&nologo=true', 
        author: '唐家三少 (授权)', 
        platform: 'Qidian', 
        price: 5000, 
        tags: ['玄幻', '热血', '大IP'], 
        description: '经典玄幻IP的全新改编授权，适合制作长篇连载漫剧。', 
        isPurchased: false 
    },
    { 
        id: 'ip2', 
        title: '我在精神病院学斩神', 
        cover: 'https://image.pollinations.ai/prompt/anime%20style%20urban%20fantasy%20cover%20young%20man%20with%20knives%20red%20moonlight%20asylum%20background?width=450&height=600&nologo=true', 
        author: '三九音域', 
        platform: 'Tomato', 
        price: 3500, 
        tags: ['都市', '异能', '爽文'], 
        description: '番茄小说霸榜神作，节奏快，适合短视频平台分发。', 
        isPurchased: false 
    },
    { 
        id: 'ip3', 
        title: '全职高手：荣耀归来', 
        cover: 'https://image.pollinations.ai/prompt/anime%20style%20esports%20cover%20gamer%20at%20computer%20avatar%20silhouette%20futuristic%20arena?width=450&height=600&nologo=true', 
        author: '蝴蝶蓝', 
        platform: 'Qidian', 
        price: 4500, 
        tags: ['电竞', '群像', '励志'], 
        description: '电竞文巅峰之作，人物群像精彩，粉丝基础庞大。', 
        isPurchased: false 
    },
    { 
        id: 'ip4', 
        title: '偷偷藏不住', 
        cover: 'https://image.pollinations.ai/prompt/anime%20style%20romance%20cover%20sweet%20couple%20in%20school%20uniform%20cherry%20blossoms%20soft%20lighting?width=450&height=600&nologo=true', 
        author: '竹已', 
        platform: 'Jinjiang', 
        price: 2800, 
        tags: ['言情', '校园', '暗恋'], 
        description: '晋江言情金榜，甜度超标，女性市场潜力巨大。', 
        isPurchased: true 
    },
];

const MOCK_COURSES: Course[] = [
    { id: 'co1', title: 'AI 漫剧制作全流程实战营', cover: 'https://placehold.co/600x400/222/white?text=AI+Course+1', type: 'Online', level: UserLevel.BASIC, status: 'Ongoing', instructor: 'Sparkreel 官方导师团', date: '2023-11-01' },
    { id: 'co2', title: 'Stable Diffusion 角色一致性高阶课', cover: 'https://placehold.co/600x400/222/white?text=SD+Course', type: 'Online', level: UserLevel.ELITE, status: 'Pending', instructor: 'AI 绘图大神 K', date: '2023-11-15' },
    { id: 'co3', title: '北京7日线下孵化营：从剧本到融资', cover: 'https://placehold.co/600x400/222/white?text=Offline+Bootcamp', type: 'Offline', level: UserLevel.CORE, status: 'Pending', instructor: '资深制片人 & 投资人', date: '2023-12-01' },
    { id: 'co4', title: '短剧出海变现特训班', cover: 'https://placehold.co/600x400/222/white?text=Global+Distribution', type: 'Online', level: UserLevel.ELITE, status: 'Ended', instructor: '海外发行总监', date: '2023-10-15' },
];

const MOCK_NEWS: CreatorNews[] = [
    { id: 'n1', title: 'Sparkreel 创作者"星际工作室"获千万融资', source: '36氪', date: '2小时前', summary: '专注于科幻题材的AI漫剧团队获得红杉资本领投。', image: 'https://picsum.photos/id/50/200/120' },
    { id: 'n2', title: 'AI漫剧《霓虹之夜》全网播放破亿', source: '新浪科技', date: '1天前', summary: '首部全AI制作的赛博朋克短剧引爆全网，主创团队分享制作心得。', image: 'https://picsum.photos/id/51/200/120' },
    { id: 'n3', title: 'Sparkreel 发布全新 "Fusion 2.0" 引擎', source: '官方公告', date: '3天前', summary: '角色一致性提升80%，渲染速度提升200%。', image: 'https://picsum.photos/id/52/200/120' },
];


// --- HELPER COMPONENTS ---

const Modal = ({ title, children, onClose, size = 'md' }: { title: string, children?: React.ReactNode, onClose: () => void, size?: 'md'|'lg'|'xl' }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-left">
      <div className={`bg-spark-surface border border-spark-border rounded-xl w-full ${size === 'xl' ? 'max-w-6xl' : size === 'lg' ? 'max-w-4xl' : 'max-w-lg'} shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 flex flex-col`}>
        <div className="flex justify-between items-center p-6 border-b border-spark-border sticky top-0 bg-spark-surface z-10 shrink-0">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.Close /></button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
            {children}
        </div>
      </div>
    </div>
);

// ... (Existing PaymentModal, RechargeModal, AssetEditor code) ...
const PaymentModal = ({ onClose, title, amount, type = 'recharge', bonusRate = 0 }: { onClose: () => void, title: string, amount: number, type?: 'recharge'|'membership', bonusRate?: number }) => {
    return (
        <Modal title={title} onClose={onClose} size="lg">
            <div className="space-y-6">
                <div className="bg-spark-card border border-spark-border rounded-lg p-6 flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-400 mb-1">支付金额</div>
                        <div className="text-3xl font-bold text-white">¥ {amount.toLocaleString()}</div>
                    </div>
                    {type === 'recharge' && bonusRate > 0 && (
                         <div className="bg-spark-accent/10 border border-spark-accent/20 px-4 py-2 rounded-lg">
                             <div className="text-xs text-spark-accent font-bold">额外赠送</div>
                             <div className="text-lg font-bold text-white">+{amount * bonusRate} 积分</div>
                         </div>
                    )}
                     {type === 'membership' && (
                         <div className="bg-spark-accent/10 border border-spark-accent/20 px-4 py-2 rounded-lg">
                             <div className="text-xs text-spark-accent font-bold">权益</div>
                             <div className="text-lg font-bold text-white">终身有效</div>
                         </div>
                    )}
                </div>

                <div className="pt-4 border-t border-spark-border">
                    <div className="text-sm text-gray-400 mb-4">选择支付方式</div>
                    <div className="grid grid-cols-3 gap-4">
                        <button className="py-4 rounded-xl bg-[#09bb07]/10 border border-[#09bb07]/30 text-[#09bb07] font-bold flex flex-col items-center justify-center gap-2 hover:bg-[#09bb07] hover:text-white transition-all">
                            <Icons.Wechat size={28}/> 微信支付
                        </button>
                        <button className="py-4 rounded-xl bg-[#1677FF]/10 border border-[#1677FF]/30 text-[#1677FF] font-bold flex flex-col items-center justify-center gap-2 hover:bg-[#1677FF] hover:text-white transition-all">
                            <Icons.Wallet size={28}/> 支付宝
                        </button>
                         <button className="py-4 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 font-bold flex flex-col items-center justify-center gap-2 hover:bg-gray-700 hover:text-white transition-all">
                            <Icons.CreditCard size={28}/> 银行转账
                        </button>
                    </div>
                </div>
                
                 <div className="text-center text-xs text-gray-500 mt-4">
                    支付即代表同意 <a href="#" className="text-spark-accent underline">《用户付费协议》</a>
                </div>
            </div>
        </Modal>
    );
};

const RechargeModal = ({ onClose, userLevel }: { onClose: () => void, userLevel: UserLevel }) => {
    const [step, setStep] = useState<'select' | 'pay'>('select');
    const [amount, setAmount] = useState(0);
    const bonusRate = userLevel === UserLevel.CORE ? 0.5 : userLevel === UserLevel.ELITE ? 0.25 : 0;
    const options = [{ price: 100, credits: 100 }, { price: 500, credits: 500 }, { price: 1000, credits: 1000 }, { price: 5000, credits: 5000 }];

    if (step === 'pay') return <PaymentModal onClose={onClose} title="充值积分" amount={amount} type="recharge" bonusRate = {bonusRate} />;

    return (
        <Modal title="充值积分" onClose={onClose} size="lg">
             <div className="grid grid-cols-2 gap-4">
                 {options.map((opt, i) => (
                     <div key={i} onClick={() => { setAmount(opt.price); setStep('pay'); }} className="bg-spark-card border border-spark-border p-6 rounded-xl hover:border-spark-accent cursor-pointer group relative overflow-hidden transition-all hover:bg-spark-surface">
                         <div className="relative z-10">
                             <div className="text-3xl font-bold text-white mb-1">¥ {opt.price}</div>
                             <div className="text-gray-400 text-sm flex items-center gap-2">
                                 {opt.credits} 积分
                                 {bonusRate > 0 && <span className="text-spark-accent bg-spark-accent/10 px-2 rounded text-xs">送 {opt.credits * bonusRate}</span>}
                             </div>
                         </div>
                         <Icons.CreditCard className="absolute -bottom-4 -right-4 text-spark-surface w-24 h-24 group-hover:text-spark-accent/10 transition-colors" />
                     </div>
                 ))}
             </div>
        </Modal>
    );
};

// ... (AssetEditor, AssetSelector, RadioGroup, ScriptToVideoWizard, SnippetEditor components as previously defined) ...
const AssetEditor = ({ type, project, onSave, onCancel }: { type: 'Character' | 'Scene' | 'Prop', project: Project, onSave: (asset: any) => void, onCancel: () => void }) => {
    const [creationMode, setCreationMode] = useState<AssetCreationMode>(AssetCreationMode.MODEL_GEN);
    const [name, setName] = useState('');
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState<AiModel>(AiModel.WAN_2_5);
    const [gender, setGender] = useState('Female');
    const [ageGroup, setAgeGroup] = useState('Teen');
    const [generationHistory, setGenerationHistory] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(async () => {
            const mockImage = `https://picsum.photos/400/400?random=${Date.now()}`;
            setGenerationHistory(prev => [mockImage, ...prev]);
            setSelectedImage(mockImage);
            setIsGenerating(false);
        }, 2000);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setGenerationHistory(prev => [imageUrl, ...prev]);
        }
    };

    const handleConfirm = () => {
        if (!selectedImage) return;
        const newAsset = {
            id: `${type.toLowerCase()}_${Date.now()}`,
            name,
            creationMode,
            model,
            prompt,
            gender: type === 'Character' ? gender : undefined,
            ageGroup: type === 'Character' ? ageGroup : undefined,
            previewImage: selectedImage,
        };
        onSave(newAsset);
    };

    return (
        <div className="h-full flex bg-black">
            {/* LEFT PANE: CONFIGURATION */}
            <div className="w-[400px] border-r border-spark-border bg-spark-surface p-6 flex flex-col overflow-y-auto">
                <div onClick={onCancel} className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer mb-6">
                    <Icons.ChevronLeft size={20}/> <span>返回列表</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-6">新建{type === 'Character' ? '角色' : type === 'Scene' ? '场景' : '物品'}</h2>
                
                <div className="space-y-6 flex-1">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">{type}名称</label>
                        <input className="w-full bg-black border border-spark-border rounded-lg p-3 text-white outline-none focus:border-spark-accent" value={name} onChange={e => setName(e.target.value)} placeholder="输入名称"/>
                    </div>

                    <div className="bg-black p-1 rounded-lg border border-spark-border flex">
                        {Object.values(AssetCreationMode).map(mode => (
                            <button key={mode} onClick={() => setCreationMode(mode)} className={`flex-1 py-2 text-xs rounded transition-colors ${creationMode === mode ? 'bg-spark-accent text-black font-bold' : 'text-gray-400 hover:text-white'}`}>{mode}</button>
                        ))}
                    </div>

                    {type === 'Character' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs text-gray-400 mb-2 block">性别</label><select className="w-full bg-black border border-spark-border rounded-lg p-3 text-white" value={gender} onChange={e => setGender(e.target.value)}><option value="Female">女</option><option value="Male">男</option></select></div>
                            <div><label className="text-xs text-gray-400 mb-2 block">年龄段</label><select className="w-full bg-black border border-spark-border rounded-lg p-3 text-white" value={ageGroup} onChange={e => setAgeGroup(e.target.value)}><option value="Teen">少年</option><option value="Adult">成年</option></select></div>
                        </div>
                    )}

                    {creationMode === AssetCreationMode.MODEL_GEN && (
                        <>
                            <div>
                                <label className="text-xs text-gray-400 mb-2 block">选择模型</label>
                                <select className="w-full bg-black border border-spark-border rounded-lg p-3 text-white" value={model} onChange={e => setModel(e.target.value as AiModel)}>{Object.values(AiModel).map(m => <option key={m} value={m}>{m}</option>)}</select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-2 block">描述词 (Prompt)</label>
                                <textarea className="w-full h-32 bg-black border border-spark-border rounded-lg p-3 text-white resize-none" placeholder={`描述${type}的外貌特征...`} value={prompt} onChange={e => setPrompt(e.target.value)} />
                            </div>
                        </>
                    )}

                    {creationMode === AssetCreationMode.UPLOAD && (
                         <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-spark-border rounded-lg h-32 flex flex-col items-center justify-center text-gray-500 hover:border-spark-accent cursor-pointer">
                             <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
                             <Icons.Upload size={24} className="mb-2"/>
                             <span className="text-xs">点击上传参考图 (本地文件)</span>
                         </div>
                    )}

                    <button disabled={isGenerating || !name} onClick={handleGenerate} className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${isGenerating ? 'bg-gray-800 text-gray-500' : 'bg-spark-accent text-black hover:bg-spark-accentHover'}`}>
                        {isGenerating ? <Icons.Flame className="animate-spin"/> : <Icons.Magic size={18}/>} {isGenerating ? '正在生成...' : '立即生成'}
                    </button>
                </div>
            </div>

            {/* RIGHT PANE: PREVIEW & HISTORY */}
            <div className="flex-1 p-6 flex flex-col gap-6">
                <div className="h-1/2 flex flex-col">
                    <h3 className="text-gray-400 text-sm font-bold mb-4 flex items-center justify-between">
                        <span>{type}生成任务列表</span>
                        <span className="text-xs bg-spark-card px-2 py-1 rounded border border-spark-border">{generationHistory.length} 个任务</span>
                    </h3>
                    <div className="flex-1 bg-spark-surface rounded-xl border border-spark-border p-4 overflow-y-auto grid grid-cols-4 gap-4 content-start">
                        {generationHistory.map((img, idx) => (
                            <div key={idx} onClick={() => setSelectedImage(img)} className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${selectedImage === img ? 'border-spark-accent' : 'border-transparent hover:border-gray-600'}`}>
                                <img src={img} className="w-full h-full object-cover"/>
                            </div>
                        ))}
                        {generationHistory.length === 0 && <div className="col-span-4 h-full flex items-center justify-center text-gray-600">暂无生成记录</div>}
                    </div>
                </div>
                <div className="h-1/2 flex flex-col">
                    <h3 className="text-gray-400 text-sm font-bold mb-4">确定出演{type}</h3>
                    <div className="flex-1 bg-spark-surface rounded-xl border border-spark-border flex items-center justify-center relative overflow-hidden">
                        {selectedImage ? (
                            <div className="relative w-full h-full group flex items-center justify-center">
                                <img src={selectedImage} className="max-h-full max-w-full object-contain"/>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={handleConfirm} className="bg-spark-accent text-black font-bold px-8 py-3 rounded-lg transform scale-105 hover:scale-110 transition-transform">确认使用该{type}</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-gray-600">
                                <Icons.Box size={48} className="mb-4 opacity-50"/>
                                <p>请从上方列表选择满意的结果</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// New Helper Component for Asset Selection Grid
const AssetSelector = ({ title, items, selectedId, onSelect, emptyText = "无" }: any) => (
    <div className="mb-4">
        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{title}</label>
        <div className="grid grid-cols-4 gap-2">
            <button
                onClick={() => onSelect(null)}
                className={`aspect-square rounded-lg border flex items-center justify-center text-xs ${!selectedId ? 'border-spark-accent text-spark-accent bg-spark-accent/10' : 'border-spark-border text-gray-500 hover:border-gray-400'}`}
            >
                {emptyText}
            </button>
            {items.map((item: any) => (
                <div key={item.id} onClick={() => onSelect(item.id)} className={`aspect-square rounded-lg border overflow-hidden relative cursor-pointer group ${selectedId === item.id ? 'border-spark-accent ring-1 ring-spark-accent' : 'border-spark-border opacity-70 hover:opacity-100'}`}>
                    <img src={item.previewImage || item.image} className="w-full h-full object-cover"/>
                    {selectedId === item.id && <div className="absolute inset-0 bg-spark-accent/20"/>}
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white p-1 truncate text-center opacity-0 group-hover:opacity-100 transition-opacity">{item.name}</div>
                </div>
            ))}
        </div>
    </div>
);

// New Helper for Radio Group Selection
const RadioGroup = ({ label, options, value, onChange }: any) => (
    <div className="mb-4">
        <label className="text-xs text-gray-500 block mb-2">{label}</label>
        <div className="flex bg-black border border-spark-border rounded-lg p-1 gap-1">
            {options.map((opt: any) => (
                <button 
                    key={opt} 
                    onClick={() => onChange(opt)} 
                    className={`flex-1 py-1.5 text-xs rounded transition-all ${value === opt ? 'bg-spark-accent text-black font-bold shadow' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);

// --- SCRIPT TO VIDEO WIZARD ---
const ScriptToVideoWizard = ({ project, onCancel, onFinish }: { project: Project, onCancel: () => void, onFinish: (vids: FinalVideo[]) => void }) => {
    // ... (ScriptToVideoWizard implementation omitted for brevity as it was not changed, keeping file consistent)
    // For XML output consistency I will include the full component to ensure file integrity.
    // ... (To save space in response, I am assuming the user has the existing content. 
    // BUT the instructions say "Full content". I will provide the full content for the updated sections 
    // and abbreviated for unchanged sections if allowed, but to be safe I will just include everything 
    // or rely on the user merging. Given the "Full content" instruction I must provide the full file.
    // However, the file is huge. I will focus on providing the full `App.tsx` with the requested updates to `IncubatorView`.)

    // ... (Resuming full code for Wizard)
    const [state, setState] = useState<ScriptVideoState>({
        step: WizardStep.SCRIPT,
        script: { title: '', maxShots: 10, content: '' },
        selectedAssets: { characters: [], scenes: [], props: [] },
        storyboards: [],
        fusionImages: [],
        finalVideos: []
    });

    const [loading, setLoading] = useState(false);
    const [dubbingModalOpen, setDubbingModalOpen] = useState(false);
    const [showAssetSelector, setShowAssetSelector] = useState<'characters' | 'scenes' | 'props' | null>(null);
    const [globalModel, setGlobalModel] = useState<AiModel>(AiModel.WAN_2_5);
    const [modifyingShot, setModifyingShot] = useState<Storyboard | null>(null);
    const [modificationPrompt, setModificationPrompt] = useState("");
    const [globalVideoSettings, setGlobalVideoSettings] = useState({
        model: AiModel.WAN_2_5,
        resolution: '1080p',
        duration: '5',
        count: '1'
    });
    const [editingFusionItem, setEditingFusionItem] = useState<FusionImage | null>(null);
    const editRefPoseInput = useRef<HTMLInputElement>(null);
    const [editingVideoItem, setEditingVideoItem] = useState<FusionImage | null>(null);
    const [editVideoSettings, setEditVideoSettings] = useState({
        model: AiModel.WAN_2_5,
        duration: '5s',
        resolution: '1080p',
        count: 1,
        prompt: ''
    });

    const nextStep = () => setState(prev => ({ ...prev, step: prev.step + 1 }));
    const prevStep = () => setState(prev => ({ ...prev, step: prev.step - 1 }));

    // ... (Wizard helper functions)
    const generateStoryboards = () => {
        setLoading(true);
        setTimeout(() => {
            const shots: Storyboard[] = [];
            for (let i = 0; i < 5; i++) {
                shots.push({
                    id: `shot_${Date.now()}_${i}`,
                    sequence: i + 1,
                    scriptContent: `李玄猛地睁开眼，眼球快速转动，试图理解周围情况... (Script Segment ${i + 1})`,
                    prompt: `Twod style, Anime, detailed shot of character opening eyes in shock, cinematic lighting, 8k resolution.`,
                    assets: { characterIds: [], sceneId: null, propIds: [] },
                    model: globalModel,
                    aspectRatio: '16:9',
                    count: 1
                });
            }
            setState(prev => ({ ...prev, storyboards: shots }));
            setLoading(false);
            nextStep();
        }, 2000);
    };

    const handleInsertShot = (index: number) => {
        const newShot: Storyboard = {
            id: `shot_${Date.now()}_new`,
            sequence: 0,
            scriptContent: "New inserted segment",
            prompt: "New shot description",
            assets: { characterIds: [], sceneId: null, propIds: [] },
            model: globalModel,
            aspectRatio: '16:9',
            count: 1
        };
        setState(prev => {
            const newStoryboards = [...prev.storyboards];
            newStoryboards.splice(index + 1, 0, newShot);
            return {
                ...prev,
                storyboards: newStoryboards.map((s, i) => ({ ...s, sequence: i + 1 }))
            };
        });
    };

    const handleDeleteShot = (id: string) => {
        setState(prev => ({
            ...prev,
            storyboards: prev.storyboards.filter(s => s.id !== id).map((s, i) => ({ ...s, sequence: i + 1 }))
        }));
    };

    const handleAiModifyClick = (shot: Storyboard) => {
        setModifyingShot(shot);
        setModificationPrompt(shot.prompt);
    };

    const confirmAiModify = () => {
        if (modifyingShot) {
            setState(prev => ({
                ...prev,
                storyboards: prev.storyboards.map(s => s.id === modifyingShot.id ? { ...s, prompt: modificationPrompt } : s)
            }));
            setModifyingShot(null);
        }
    };

    const generateFusionImages = () => {
        setLoading(true);
        setTimeout(() => {
            const images: FusionImage[] = state.storyboards.map(s => ({
                id: `img_${s.id}`,
                storyboardId: s.id,
                imageUrl: `https://picsum.photos/400/225?random=${s.id}`,
                prompt: s.prompt,
                videoModel: globalVideoSettings.model,
                resolution: globalVideoSettings.resolution as any,
                duration: globalVideoSettings.duration + 's' as any,
                count: parseInt(globalVideoSettings.count),
                status: 'done',
                aspectRatio: s.aspectRatio === '16:9' ? '16:9' : s.aspectRatio === '9:16' ? '9:16' : '1:1',
                assets: { ...s.assets }
            }));
            setState(prev => ({ ...prev, fusionImages: images }));
            setLoading(false);
            nextStep();
        }, 2000);
    };

    const handleGlobalSettingChange = (field: string, value: any) => {
        setGlobalVideoSettings(prev => ({ ...prev, [field]: value }));
        setState(prev => ({
            ...prev,
            fusionImages: prev.fusionImages.map(img => {
                const updates: any = {};
                if (field === 'model') updates.videoModel = value;
                if (field === 'resolution') updates.resolution = value;
                if (field === 'duration') updates.duration = value + 's';
                if (field === 'count') updates.count = parseInt(value);
                return { ...img, ...updates };
            })
        }));
    };

    const updateFusionItem = (id: string, updates: Partial<FusionImage>) => {
        setState(prev => ({
            ...prev,
            fusionImages: prev.fusionImages.map(img => img.id === id ? { ...img, ...updates } : img)
        }));
    };

    const deleteFusionItem = (id: string) => {
        setState(prev => ({
            ...prev,
            fusionImages: prev.fusionImages.filter(img => img.id !== id)
        }));
    };

    const handleAssetToggleInFusion = (type: 'characters' | 'scenes' | 'props', id: string) => {
        if (!editingFusionItem) return;
        let newAssets = { ...editingFusionItem.assets };
        if (type === 'characters') {
            if (newAssets.characterIds.includes(id)) newAssets.characterIds = newAssets.characterIds.filter(cid => cid !== id);
            else newAssets.characterIds = [...newAssets.characterIds, id];
        } else if (type === 'scenes') {
             if (newAssets.sceneId === id) newAssets.sceneId = null;
             else newAssets.sceneId = id;
        } else if (type === 'props') {
            if (newAssets.propIds.includes(id)) newAssets.propIds = newAssets.propIds.filter(pid => pid !== id);
            else newAssets.propIds = [...newAssets.propIds, id];
        }
        setEditingFusionItem({ ...editingFusionItem, assets: newAssets });
    };

    const saveFusionEdit = () => {
        if (editingFusionItem) {
            updateFusionItem(editingFusionItem.id, editingFusionItem);
            setEditingFusionItem(null);
        }
    };

    const generateFinalVideos = () => {
        setLoading(true);
        setTimeout(() => {
            const newVideos: FinalVideo[] = [];
            state.fusionImages.forEach(img => {
                for (let i = 0; i < img.count; i++) {
                     newVideos.push({
                        id: `vid_${img.id}_${i}`,
                        fusionImageId: img.id,
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                        prompt: img.prompt
                    });
                }
                img.confirmedVideoId = `vid_${img.id}_0`;
            });
            setState(prev => ({ ...prev, finalVideos: newVideos }));
            setLoading(false);
            nextStep();
        }, 2000);
    };

    const handleConfirmVideo = (fusionImageId: string, videoId: string) => {
        setState(prev => ({
            ...prev,
            fusionImages: prev.fusionImages.map(img => img.id === fusionImageId ? { ...img, confirmedVideoId: videoId } : img)
        }));
    };

    const openVideoEditModal = (fusionImg: FusionImage) => {
        setEditingVideoItem(fusionImg);
        setEditVideoSettings({
            model: fusionImg.videoModel,
            duration: fusionImg.duration,
            resolution: fusionImg.resolution,
            count: 1,
            prompt: fusionImg.prompt
        });
    };

    const handleRegenerateVideo = () => {
        if (!editingVideoItem) return;
        const newVidId = `vid_${editingVideoItem.id}_new_${Date.now()}`;
        const newVideo: FinalVideo = {
            id: newVidId,
            fusionImageId: editingVideoItem.id,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            prompt: editVideoSettings.prompt
        };
        setState(prev => ({
            ...prev,
            finalVideos: [...prev.finalVideos, newVideo],
            fusionImages: prev.fusionImages.map(img => img.id === editingVideoItem.id ? { ...img, confirmedVideoId: newVidId } : img)
        }));
        setEditingVideoItem(null);
    };

    const toggleAssetSelection = (type: 'characters'|'scenes'|'props', item: any) => {
        const list = state.selectedAssets[type];
        const exists = list.find((i: any) => i.id === item.id);
        const newList = exists ? list.filter((i: any) => i.id !== item.id) : [...list, item];
        setState(prev => ({ ...prev, selectedAssets: { ...prev.selectedAssets, [type]: newList } }));
    };

    const AssetSelectionModal = ({ type, items, selected, onToggle, onClose }: any) => (
        <Modal title={`添加${type === 'characters' ? '角色' : type === 'scenes' ? '场景' : '物品'}`} onClose={onClose} size="lg">
            <div className="grid grid-cols-5 gap-4">
                {items.map((item: any) => {
                    const isSelected = selected.some((i: any) => i.id === item.id);
                    return (
                        <div key={item.id} onClick={() => onToggle(type, item)} className={`aspect-[3/4] bg-spark-card border rounded-lg overflow-hidden relative cursor-pointer group ${isSelected ? 'border-spark-accent ring-2 ring-spark-accent' : 'border-spark-border hover:border-gray-500'}`}>
                            <img src={item.previewImage || item.image} className="w-full h-full object-cover"/>
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-xs text-white truncate text-center">{item.name}</div>
                            {isSelected && <div className="absolute top-2 right-2 bg-spark-accent text-black rounded-full p-1 shadow"><Icons.Check size={12}/></div>}
                        </div>
                    );
                })}
                {items.length === 0 && <div className="col-span-5 text-center text-gray-500 py-10">暂无可用资产，请先在项目管理中创建</div>}
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="bg-spark-accent text-black px-6 py-2 rounded font-bold">确认添加</button>
            </div>
        </Modal>
    );

    const renderStepper = () => (
        <div className="flex justify-center gap-12 mb-8 py-4 border-b border-spark-border bg-spark-surface">
            {[
                { id: 1, label: '输入剧本' },
                { id: 2, label: '资产详情' },
                { id: 3, label: '分镜管理' },
                { id: 4, label: '融图管理' },
                { id: 5, label: '视频编辑' }
            ].map(step => (
                <div key={step.id} className={`flex items-center gap-2 ${state.step >= step.id ? 'text-spark-accent' : 'text-gray-600'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${state.step >= step.id ? 'bg-spark-accent text-black' : 'bg-gray-800 border border-gray-600'}`}>{step.id}</div>
                    <span className="text-sm font-bold">{step.label}</span>
                    {step.id < 5 && <Icons.ChevronRight size={14} className="text-gray-700 ml-8"/>}
                </div>
            ))}
        </div>
    );

    const handleFinishWizard = () => {
        const confirmedVideos = state.fusionImages.map(img => {
            const vid = state.finalVideos.find(v => v.id === img.confirmedVideoId);
            return vid || state.finalVideos.find(v => v.fusionImageId === img.id);
        }).filter(v => v !== undefined) as FinalVideo[];
        onFinish(confirmedVideos);
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="h-16 flex items-center justify-between px-6 border-b border-spark-border bg-spark-surface">
                <div className="text-white font-bold flex items-center gap-4">
                    <button onClick={onCancel}><Icons.Close className="text-gray-400 hover:text-white"/></button>
                    按剧本生视频 Wizard
                </div>
                {state.step > 1 && <button onClick={prevStep} className="bg-gray-800 text-white border border-gray-600 px-4 py-1.5 rounded font-bold hover:bg-gray-700">上一步</button>}
                {state.step === WizardStep.VIDEO_EDIT && <button onClick={handleFinishWizard} className="bg-spark-accent text-black px-4 py-1.5 rounded font-bold">完成并导出</button>}
            </div>

            {renderStepper()}

            <div className="flex-1 overflow-y-auto p-8 w-full">
                {/* STEP 1: SCRIPT INPUT */}
                {state.step === WizardStep.SCRIPT && (
                    <div className="space-y-6 max-w-full h-full flex flex-col">
                        <div className="flex gap-6">
                            <div className="w-1/2">
                                <label className="block text-gray-400 text-sm mb-2">剧本标题</label>
                                <input className="w-full bg-gray-900 border border-spark-border rounded p-3 text-white" value={state.script.title} onChange={e => setState(p => ({...p, script: {...p.script, title: e.target.value}}))} placeholder="第一集"/>
                            </div>
                            <div className="w-1/2">
                                <label className="block text-gray-400 text-sm mb-2">最大分镜数 (Max 80)</label>
                                <input type="number" className="w-full bg-gray-900 border border-spark-border rounded p-3 text-white" value={state.script.maxShots} onChange={e => setState(p => ({...p, script: {...p.script, maxShots: parseInt(e.target.value)}}))} />
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <label className="block text-gray-400 text-sm mb-2">剧本内容</label>
                            <textarea className="w-full flex-1 bg-gray-900 border border-spark-border rounded p-3 text-white resize-none font-mono leading-relaxed" value={state.script.content} onChange={e => setState(p => ({...p, script: {...p.script, content: e.target.value}}))} placeholder="输入剧本内容..."/>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={nextStep} disabled={!state.script.content} className="bg-spark-accent text-black px-8 py-3 rounded-lg font-bold disabled:opacity-50">下一步: 资产选择</button>
                        </div>
                    </div>
                )}
                
                {/* ... Steps 2-5 are same as original, keeping structure to allow correct merging or full replace ... */}
                {/* For brevity, if I must output valid XML, I will assume the previous full content is there and just replace IncubatorView section below */}
                {/* However, since I am replacing the full file content in the XML block, I need to include EVERYTHING. */}
                {/* Proceeding with full content for Steps 2-5 */}

                {/* STEP 2: ASSET SELECTION */}
                {state.step === WizardStep.ASSETS && (
                    <div className="flex flex-col h-full w-full px-6">
                         {/* ... (Existing Step 2 content) ... */}
                         {/* Since I cannot "reference" previous content in a replacement block, I will just paste it. */}
                        <div className="grid grid-cols-3 gap-6 flex-1 h-full">
                            {/* Characters Column */}
                            <div className="bg-spark-card border border-spark-border rounded-xl p-4 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-white font-bold flex items-center gap-2"><Icons.User size={18}/> 角色</h3>
                                    <button onClick={() => setShowAssetSelector('characters')} className="bg-purple-900/30 text-purple-400 border border-purple-800 px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-purple-900/50 hover:text-white transition-colors"><Icons.Plus size={12}/> 添加角色</button>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                                    {state.selectedAssets.characters.map((item: any) => (
                                        <div key={item.id} className="flex gap-3 bg-gray-900/50 p-2 rounded-lg border border-gray-800 relative group">
                                            <div className="w-16 h-20 rounded overflow-hidden flex-shrink-0">
                                                <img src={item.previewImage} className="w-full h-full object-cover"/>
                                            </div>
                                            <div className="flex-1 py-1">
                                                <div className="text-sm font-bold text-white mb-1">{item.name}</div>
                                                <div className="text-xs text-gray-500">{item.gender} · {item.ageGroup}</div>
                                                <div className="text-[10px] text-gray-600 mt-2">Model Gen</div>
                                            </div>
                                            <button onClick={() => toggleAssetSelection('characters', item)} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 transition-colors"><Icons.Trash size={14}/></button>
                                        </div>
                                    ))}
                                    {state.selectedAssets.characters.length === 0 && <div className="text-center text-gray-600 py-10 text-sm">暂无角色，请添加</div>}
                                </div>
                            </div>
                            {/* Scenes Column */}
                            <div className="bg-spark-card border border-spark-border rounded-xl p-4 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-white font-bold flex items-center gap-2"><Icons.Image size={18}/> 场景</h3>
                                    <button onClick={() => setShowAssetSelector('scenes')} className="bg-blue-900/30 text-blue-400 border border-blue-800 px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-blue-900/50 hover:text-white transition-colors"><Icons.Plus size={12}/> 添加场景</button>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                                    {state.selectedAssets.scenes.map((item: any) => (
                                        <div key={item.id} className="flex gap-3 bg-gray-900/50 p-2 rounded-lg border border-gray-800 relative group">
                                            <div className="w-24 h-16 rounded overflow-hidden flex-shrink-0">
                                                <img src={item.image} className="w-full h-full object-cover"/>
                                            </div>
                                            <div className="flex-1 py-1">
                                                <div className="text-sm font-bold text-white mb-1">{item.name}</div>
                                                <div className="text-[10px] text-gray-600">{item.creationMode}</div>
                                            </div>
                                            <button onClick={() => toggleAssetSelection('scenes', item)} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 transition-colors"><Icons.Trash size={14}/></button>
                                        </div>
                                    ))}
                                    {state.selectedAssets.scenes.length === 0 && <div className="text-center text-gray-600 py-10 text-sm">暂无场景，请添加</div>}
                                </div>
                            </div>
                            {/* Props Column */}
                            <div className="bg-spark-card border border-spark-border rounded-xl p-4 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-white font-bold flex items-center gap-2"><Icons.Box size={18}/> 物品</h3>
                                    <button onClick={() => setShowAssetSelector('props')} className="bg-green-900/30 text-green-400 border border-green-800 px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-green-900/50 hover:text-white transition-colors"><Icons.Plus size={12}/> 添加物品</button>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                                    {state.selectedAssets.props.map((item: any) => (
                                        <div key={item.id} className="flex gap-3 bg-gray-900/50 p-2 rounded-lg border border-gray-800 relative group">
                                            <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                                                <img src={item.previewImage} className="w-full h-full object-cover"/>
                                            </div>
                                            <div className="flex-1 py-1">
                                                <div className="text-sm font-bold text-white mb-1">{item.name}</div>
                                                <div className="text-[10px] text-gray-600">{item.model}</div>
                                            </div>
                                            <button onClick={() => toggleAssetSelection('props', item)} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 transition-colors"><Icons.Trash size={14}/></button>
                                        </div>
                                    ))}
                                    {state.selectedAssets.props.length === 0 && <div className="text-center text-gray-600 py-10 text-sm">暂无物品，请添加</div>}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-6">
                            <button onClick={generateStoryboards} className="bg-spark-accent text-black px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-spark-accentHover">{loading ? <Icons.Flame className="animate-spin"/> : null} 生成分镜 (Step 3)</button>
                        </div>
                        {showAssetSelector === 'characters' && <AssetSelectionModal type="characters" items={project.characters} selected={state.selectedAssets.characters} onToggle={toggleAssetSelection} onClose={() => setShowAssetSelector(null)} />}
                        {showAssetSelector === 'scenes' && <AssetSelectionModal type="scenes" items={project.scenes} selected={state.selectedAssets.scenes} onToggle={toggleAssetSelection} onClose={() => setShowAssetSelector(null)} />}
                        {showAssetSelector === 'props' && <AssetSelectionModal type="props" items={project.props} selected={state.selectedAssets.props} onToggle={toggleAssetSelection} onClose={() => setShowAssetSelector(null)} />}
                    </div>
                )}

                {/* STEP 3: STORYBOARD MANAGEMENT */}
                {state.step === WizardStep.STORYBOARD && (
                    <div className="space-y-6 w-full">
                        <div className="flex items-center justify-between">
                            <div className="text-gray-400 text-sm">分镜列表 (点击分镜面板可展开/折叠)</div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">模型选择</span>
                                    <select className="bg-black border border-spark-border rounded px-2 py-1 text-sm text-white" value={globalModel} onChange={e => setGlobalModel(e.target.value as AiModel)}>
                                        {Object.values(AiModel).map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <button className="bg-purple-900/30 border border-purple-800 text-purple-300 px-4 py-1.5 rounded text-sm hover:bg-purple-900/50 transition-colors">AI 二次修改 (消耗10积分)</button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {state.storyboards.map((shot, idx) => (
                                <div key={shot.id} className="bg-spark-card border border-spark-border rounded-xl overflow-hidden">
                                    <div className="bg-spark-surface p-4 border-b border-spark-border flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <button className="text-gray-400 hover:text-white"><Icons.ChevronRight size={16}/></button>
                                            <div className="bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded">分镜 {shot.sequence}</div>
                                            <div className="text-sm text-gray-400 truncate max-w-2xl">融图提示词: {shot.prompt}</div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleInsertShot(idx)} className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-purple-500 flex items-center gap-1"><Icons.Plus size={12}/> 插入分镜</button>
                                            <button onClick={() => handleDeleteShot(shot.id)} className="text-gray-500 hover:text-red-500 flex items-center gap-1 text-xs"><Icons.Trash size={12}/> 删除</button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-black/20 flex gap-6">
                                        <div className="w-1/3 space-y-3">
                                            <div className="flex gap-4 text-xs">
                                                <div><span className="text-pink-500 font-bold">模型:</span> <span className="text-gray-400">{globalModel}</span></div>
                                                <div><span className="text-pink-500 font-bold">比例:</span> <span className="text-gray-400">{shot.aspectRatio}</span></div>
                                            </div>
                                            <div>
                                                <span className="text-pink-500 text-xs font-bold block mb-1">分镜描述:</span>
                                                <div className="text-gray-300 text-sm bg-gray-900/50 p-2 rounded border border-gray-800">{shot.scriptContent}</div>
                                            </div>
                                            <button onClick={() => handleAiModifyClick(shot)} className="text-xs text-green-400 flex items-center gap-1 hover:text-green-300"><Icons.Magic size={12}/> AI 二次修改</button>
                                        </div>
                                        <div className="flex-1 border-l border-r border-spark-border px-6">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-gray-500 font-bold uppercase">包含资产</span>
                                                <button className="text-xs text-blue-400 hover:text-blue-300">编辑资产</button>
                                            </div>
                                            <div className="flex gap-2">
                                                {[...state.selectedAssets.characters.slice(0,2), ...state.selectedAssets.scenes.slice(0,1)].map((a: any, i) => (
                                                    <div key={i} className="w-12 h-12 rounded border border-gray-700 overflow-hidden relative group" title={a.name}>
                                                        <img src={a.previewImage || a.image} className="w-full h-full object-cover"/>
                                                    </div>
                                                ))}
                                                {Array.from({length: Math.max(0, 3 - (state.selectedAssets.characters.length + state.selectedAssets.scenes.length))}).map((_, i) => (
                                                    <div key={`ph_${i}`} className="w-12 h-12 rounded border border-gray-800 bg-gray-900 flex items-center justify-center text-gray-700"><Icons.Box size={16}/></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="w-48">
                                            <div className="aspect-video bg-black rounded border border-gray-800 flex items-center justify-center text-gray-600 text-xs relative group">
                                                预览占位
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"><Icons.Image size={14} className="text-gray-400"/></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={generateFusionImages} className="bg-spark-accent text-black px-8 py-3 rounded-lg font-bold flex items-center gap-2">{loading ? <Icons.Flame className="animate-spin"/> : null} 开始融图</button>
                        </div>
                        {modifyingShot && (
                            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110]">
                                <div className="bg-spark-card border border-spark-border rounded-xl w-[600px] p-6 shadow-2xl">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-white font-bold">通过提示词 AI 二次修改分镜</h3>
                                        <button onClick={() => setModifyingShot(null)} className="text-gray-400 hover:text-white"><Icons.Close/></button>
                                    </div>
                                    <div className="bg-yellow-900/20 border border-yellow-900/50 p-3 rounded mb-4 flex gap-2 items-start">
                                        <Icons.AlertTriangle size={16} className="text-yellow-500 mt-0.5"/>
                                        <div className="text-xs text-yellow-200">AI修改分镜后，已生成的视频将会被删除！请谨慎操作</div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-400 text-xs mb-2">提示词</label>
                                        <textarea 
                                            className="w-full h-32 bg-black border border-spark-border rounded p-3 text-white text-sm resize-none focus:border-spark-accent outline-none"
                                            value={modificationPrompt}
                                            onChange={e => setModificationPrompt(e.target.value)}
                                        />
                                        <div className="text-right text-xs text-gray-600 mt-1">0/1000</div>
                                    </div>
                                    <div className="flex justify-end gap-4">
                                        <button onClick={() => setModifyingShot(null)} className="px-4 py-2 rounded border border-gray-600 text-gray-300 text-sm hover:text-white">取消</button>
                                        <button onClick={confirmAiModify} className="px-6 py-2 rounded bg-purple-600 text-white text-sm font-bold hover:bg-purple-500">确定修改</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 4: FUSION MANAGEMENT */}
                {state.step === WizardStep.FUSION && (
                    <div className="space-y-6 max-w-[1400px] mx-auto w-full">
                        <div className="flex items-center gap-4 mb-4">
                             <div className="text-2xl font-bold text-white">分镜融图列表</div>
                             <div className="bg-spark-card border border-spark-border rounded-lg px-4 py-2 flex items-center gap-6 ml-auto">
                                 <div className="flex items-center gap-2">
                                     <span className="text-red-400 font-bold text-sm">*模型:</span>
                                     <select className="bg-black border border-spark-border rounded px-2 py-1 text-xs text-white" value={globalVideoSettings.model} onChange={e => handleGlobalSettingChange('model', e.target.value)}>
                                         {Object.values(AiModel).map(m => <option key={m} value={m}>{m}</option>)}
                                     </select>
                                 </div>
                                 <div className="flex items-center gap-2">
                                     <span className="text-red-400 font-bold text-sm">*分辨率:</span>
                                     <select className="bg-black border border-spark-border rounded px-2 py-1 text-xs text-white" value={globalVideoSettings.resolution} onChange={e => handleGlobalSettingChange('resolution', e.target.value)}>
                                         <option value="1080p">1080p</option><option value="720p">720p</option>
                                     </select>
                                 </div>
                                 <div className="flex items-center gap-2">
                                     <span className="text-red-400 font-bold text-sm">*时长:</span>
                                     <select className="bg-black border border-spark-border rounded px-2 py-1 text-xs text-white" value={globalVideoSettings.duration} onChange={e => handleGlobalSettingChange('duration', e.target.value)}>
                                         <option value="5">5</option><option value="10">10</option>
                                     </select>
                                 </div>
                                 <div className="flex items-center gap-2">
                                     <span className="text-red-400 font-bold text-sm">*数量:</span>
                                     <select className="bg-black border border-spark-border rounded px-2 py-1 text-xs text-white" value={globalVideoSettings.count} onChange={e => handleGlobalSettingChange('count', e.target.value)}>
                                         <option value="1">1</option><option value="2">2</option><option value="4">4</option>
                                     </select>
                                 </div>
                                 <div className="flex items-center gap-2 ml-4">
                                     <span className="text-gray-400 text-xs">进度:</span>
                                     <div className="w-32 bg-gray-800 rounded-full h-2 overflow-hidden">
                                         <div className="bg-purple-600 h-full w-[0%]"></div>
                                     </div>
                                 </div>
                             </div>
                        </div>

                        <div className="w-full bg-spark-card border border-spark-border rounded-t-xl grid grid-cols-[50px_160px_3fr_1.5fr_100px_100px_80px_120px] text-xs font-bold text-gray-400 uppercase">
                            <div className="p-4 text-center">序号</div>
                            <div className="p-4 text-center">已确认素材 <Icons.Info size={12} className="inline"/></div>
                            <div className="p-4 text-center">视频提示词</div>
                            <div className="p-4 text-center">模型</div>
                            <div className="p-4 text-center">分辨率</div>
                            <div className="p-4 text-center">时长(秒)</div>
                            <div className="p-4 text-center">数量</div>
                            <div className="p-4 text-center">操作 <Icons.Info size={12} className="inline"/></div>
                        </div>

                        <div className="space-y-2">
                            {state.fusionImages.map((img, idx) => (
                                <div key={img.id} className="w-full bg-black/40 border border-spark-border rounded grid grid-cols-[50px_160px_3fr_1.5fr_100px_100px_80px_120px] items-center text-sm hover:bg-spark-surface/30 transition-colors">
                                    <div className="p-4 text-center text-gray-500 font-mono">{idx + 1}</div>
                                    <div className="p-2 flex justify-center">
                                        <div className="w-32 aspect-video bg-gray-800 rounded overflow-hidden relative group cursor-pointer border border-gray-700">
                                            <img src={img.imageUrl} className="w-full h-full object-cover"/>
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                 <span className="text-[10px] text-white">点击预览</span>
                                            </div>
                                            <div className="absolute bottom-1 right-1 bg-black/60 rounded p-1 opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-spark-accent hover:text-black">
                                                 <Icons.RotateCcw size={12} className="text-white hover:text-black"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="bg-gray-900 border border-gray-800 rounded p-2 text-xs text-gray-300 line-clamp-3 h-20 overflow-hidden relative">
                                            {img.prompt}
                                        </div>
                                    </div>
                                    <div className="p-2 px-4">
                                         <select className="w-full bg-black border border-gray-700 rounded p-1.5 text-xs text-gray-300" value={img.videoModel} onChange={(e) => updateFusionItem(img.id, { videoModel: e.target.value as AiModel })}>
                                             {Object.values(AiModel).map(m => <option key={m} value={m}>{m}</option>)}
                                         </select>
                                    </div>
                                    <div className="p-2 px-4 text-center">
                                        <select className="bg-black border border-gray-700 rounded p-1.5 text-xs text-gray-300 w-full" value={img.resolution} onChange={(e) => updateFusionItem(img.id, { resolution: e.target.value as any })}>
                                            <option>1080p</option><option>720p</option>
                                        </select>
                                    </div>
                                    <div className="p-2 px-4 text-center">
                                        <select className="bg-black border border-gray-700 rounded p-1.5 text-xs text-gray-300 w-full" value={img.duration.replace('s','')} onChange={(e) => updateFusionItem(img.id, { duration: e.target.value + 's' as any })}>
                                            <option value="5">5</option><option value="10">10</option>
                                        </select>
                                    </div>
                                    <div className="p-2 px-4 text-center">
                                         <select className="bg-black border border-gray-700 rounded p-1.5 text-xs text-gray-300 w-full" value={img.count} onChange={(e) => updateFusionItem(img.id, { count: parseInt(e.target.value) })}>
                                            <option value={1}>1</option><option value={2}>2</option><option value={4}>4</option>
                                        </select>
                                    </div>
                                    <div className="p-4 flex gap-2 justify-center">
                                        <button onClick={() => setEditingFusionItem(img)} className="text-pink-500 hover:text-pink-400 font-bold text-xs">操作</button>
                                        <button onClick={() => deleteFusionItem(img.id)} className="text-gray-500 hover:text-red-500 font-bold text-xs">删除</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex justify-end pt-4">
                            <button onClick={generateFinalVideos} className="bg-spark-accent text-black px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-spark-accentHover">{loading ? <Icons.Flame className="animate-spin"/> : null} 开始生成视频</button>
                        </div>
                    </div>
                )}
                
                {editingFusionItem && (
                    <Modal title="编辑视频生成参数" onClose={() => setEditingFusionItem(null)} size="lg">
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-white mb-3 block">画面比例</label>
                                <div className="flex gap-3">
                                    {['16:9', '9:16', '1:1', '2.35:1'].map(ratio => (
                                        <button 
                                            key={ratio} 
                                            onClick={() => setEditingFusionItem({...editingFusionItem, aspectRatio: ratio as any})}
                                            className={`px-4 py-2 rounded border text-sm transition-all ${editingFusionItem.aspectRatio === ratio ? 'bg-spark-accent text-black font-bold border-spark-accent' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                                <label className="text-sm font-bold text-white mb-3 block">包含资产管理</label>
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-2 text-xs text-gray-500 uppercase font-bold">
                                            <span>角色 ({editingFusionItem.assets.characterIds.length})</span>
                                            <button onClick={() => { setShowAssetSelector('characters') }} className="text-spark-accent hover:text-white"><Icons.Plus size={14}/></button>
                                        </div>
                                        <div className="space-y-2">
                                            {editingFusionItem.assets.characterIds.map(cid => {
                                                const char = state.selectedAssets.characters.find(c => c.id === cid);
                                                if (!char) return null;
                                                return (
                                                    <div key={cid} className="flex items-center gap-2 bg-black border border-gray-800 p-2 rounded">
                                                        <img src={char.previewImage} className="w-8 h-8 rounded object-cover"/>
                                                        <span className="text-xs text-white truncate flex-1">{char.name}</span>
                                                        <button onClick={() => handleAssetToggleInFusion('characters', cid)} className="text-gray-500 hover:text-red-500"><Icons.X size={12}/></button>
                                                    </div>
                                                );
                                            })}
                                            {editingFusionItem.assets.characterIds.length === 0 && <div className="text-xs text-gray-600 italic">无角色</div>}
                                        </div>
                                    </div>
                                     <div>
                                        <div className="flex justify-between items-center mb-2 text-xs text-gray-500 uppercase font-bold">
                                            <span>场景</span>
                                            <button onClick={() => setShowAssetSelector('scenes')} className="text-spark-accent hover:text-white"><Icons.Plus size={14}/></button>
                                        </div>
                                        {editingFusionItem.assets.sceneId ? (
                                            (() => {
                                                const sc = state.selectedAssets.scenes.find(s => s.id === editingFusionItem.assets.sceneId);
                                                return sc ? (
                                                    <div className="flex items-center gap-2 bg-black border border-gray-800 p-2 rounded">
                                                        <img src={sc.image} className="w-8 h-8 rounded object-cover"/>
                                                        <span className="text-xs text-white truncate flex-1">{sc.name}</span>
                                                        <button onClick={() => handleAssetToggleInFusion('scenes', sc.id)} className="text-gray-500 hover:text-red-500"><Icons.X size={12}/></button>
                                                    </div>
                                                ) : <div className="text-xs text-gray-600 italic">无场景</div>
                                            })()
                                        ) : <div className="text-xs text-gray-600 italic">无场景</div>}
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2 text-xs text-gray-500 uppercase font-bold">
                                            <span>物品 ({editingFusionItem.assets.propIds.length})</span>
                                            <button onClick={() => setShowAssetSelector('props')} className="text-spark-accent hover:text-white"><Icons.Plus size={14}/></button>
                                        </div>
                                        <div className="space-y-2">
                                            {editingFusionItem.assets.propIds.map(pid => {
                                                const prop = state.selectedAssets.props.find(p => p.id === pid);
                                                if (!prop) return null;
                                                return (
                                                    <div key={pid} className="flex items-center gap-2 bg-black border border-gray-800 p-2 rounded">
                                                        <img src={prop.previewImage} className="w-8 h-8 rounded object-cover"/>
                                                        <span className="text-xs text-white truncate flex-1">{prop.name}</span>
                                                        <button onClick={() => handleAssetToggleInFusion('props', pid)} className="text-gray-500 hover:text-red-500"><Icons.X size={12}/></button>
                                                    </div>
                                                );
                                            })}
                                            {editingFusionItem.assets.propIds.length === 0 && <div className="text-xs text-gray-600 italic">无物品</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white mb-3 block">对标姿势 (可选)</label>
                                <div className="flex gap-4 items-center">
                                    <div onClick={() => editRefPoseInput.current?.click()} className="w-24 h-24 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-spark-accent hover:text-white relative overflow-hidden group">
                                        <input type="file" className="hidden" ref={editRefPoseInput} onChange={(e) => {
                                            if(e.target.files?.[0]) {
                                                setEditingFusionItem({...editingFusionItem, refPoseImage: URL.createObjectURL(e.target.files[0])});
                                            }
                                        }}/>
                                        {editingFusionItem.refPoseImage ? (
                                            <>
                                                <img src={editingFusionItem.refPoseImage} className="w-full h-full object-cover"/>
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <Icons.RotateCcw size={16}/>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Icons.User size={20} className="mb-1"/>
                                                <span className="text-[10px]">上传</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 flex-1">
                                        上传一张图片作为生成动作的参考，AI 将尽可能还原图片中的姿态或构图。
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white mb-2 block">改写视频提示词</label>
                                <textarea 
                                    className="w-full h-32 bg-black border border-spark-border rounded-lg p-3 text-sm text-white resize-none focus:border-spark-accent outline-none"
                                    value={editingFusionItem.prompt}
                                    onChange={(e) => setEditingFusionItem({...editingFusionItem, prompt: e.target.value})}
                                />
                            </div>
                            <div className="pt-4 border-t border-spark-border flex justify-end gap-3">
                                <button onClick={() => setEditingFusionItem(null)} className="px-6 py-2 rounded-lg border border-gray-600 text-gray-300 hover:text-white">取消</button>
                                <button onClick={saveFusionEdit} className="px-8 py-2 rounded-lg bg-spark-accent text-black font-bold hover:bg-spark-accentHover">保存修改</button>
                            </div>
                        </div>
                    </Modal>
                )}

                {/* STEP 5: VIDEO EDITING */}
                {state.step === WizardStep.VIDEO_EDIT && (
                    <div className="space-y-4 max-w-[1400px] mx-auto w-full">
                         <div className="w-full bg-spark-card border border-spark-border rounded-t-xl grid grid-cols-[50px_300px_1fr_300px_120px] text-xs font-bold text-gray-400 uppercase">
                            <div className="p-4 text-center">序号</div>
                            <div className="p-4 text-center">已确认素材</div>
                            <div className="p-4 text-center">视频素材 (点击星标选中)</div>
                            <div className="p-4 text-center">分镜</div>
                            <div className="p-4 text-center">操作</div>
                        </div>

                        <div className="space-y-2">
                             {state.fusionImages.map((fusionImg, idx) => {
                                 const candidates = state.finalVideos.filter(v => v.fusionImageId === fusionImg.id);
                                 const confirmedVideo = state.finalVideos.find(v => v.id === fusionImg.confirmedVideoId) || candidates[0];

                                 return (
                                     <div key={fusionImg.id} className="w-full bg-black/40 border border-spark-border rounded grid grid-cols-[50px_300px_1fr_300px_120px] items-stretch text-sm hover:bg-spark-surface/30 transition-colors">
                                         <div className="p-4 flex items-center justify-center text-gray-500 font-mono">{idx + 1}</div>
                                         <div className="p-4 flex flex-col items-center justify-center border-r border-spark-border/50">
                                             {confirmedVideo ? (
                                                 <div className="w-64 aspect-video bg-black rounded overflow-hidden relative border border-spark-accent shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                                                     <video src={confirmedVideo.videoUrl} className="w-full h-full object-cover" controls/>
                                                     <div className="absolute top-2 right-2 text-spark-accent"><Icons.Star fill="currentColor" size={16}/></div>
                                                 </div>
                                             ) : <div className="text-gray-500 text-xs">未生成</div>}
                                             <div className="mt-2 flex gap-4 text-xs text-gray-500">
                                                 <span className="flex items-center gap-1"><Icons.Clock size={12}/> 00:06</span>
                                                 <button className="hover:text-white flex items-center gap-1"><Icons.RotateCcw size={12}/> 重播</button>
                                             </div>
                                         </div>
                                         <div className="p-4 flex gap-4 overflow-x-auto items-center scrollbar-thin">
                                             {candidates.map((vid, vIdx) => (
                                                 <div key={vid.id} onClick={() => handleConfirmVideo(fusionImg.id, vid.id)} className={`w-40 aspect-video bg-black rounded overflow-hidden relative flex-shrink-0 cursor-pointer border-2 transition-all group ${vid.id === fusionImg.confirmedVideoId ? 'border-spark-accent ring-1 ring-spark-accent' : 'border-gray-800 hover:border-gray-500'}`}>
                                                     <video src={vid.videoUrl} className="w-full h-full object-cover" muted/>
                                                     {vid.id === fusionImg.confirmedVideoId && (
                                                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                             <span className="text-xs font-bold text-white">当前使用</span>
                                                         </div>
                                                     )}
                                                     <div className="absolute top-1 left-1 bg-purple-600 text-white text-[9px] px-1.5 rounded">选定第{vIdx+1}个视频</div>
                                                     {vid.id !== fusionImg.confirmedVideoId && (
                                                         <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                             <Icons.Star className="text-gray-400 hover:text-spark-accent" size={14}/>
                                                         </div>
                                                     )}
                                                 </div>
                                             ))}
                                             <button onClick={() => openVideoEditModal(fusionImg)} className="w-20 aspect-video border border-dashed border-gray-700 rounded flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-gray-500 flex-shrink-0">
                                                 <Icons.Plus size={16}/>
                                                 <span className="text-[10px] mt-1">生成更多</span>
                                             </button>
                                         </div>
                                         <div className="p-4 text-xs text-gray-400 border-l border-spark-border/50 h-full overflow-y-auto">
                                             <div className="font-bold text-white mb-2">分镜描述:</div>
                                             <p className="mb-4">{state.storyboards.find(s => s.id === fusionImg.storyboardId)?.scriptContent}</p>
                                             <div className="font-bold text-white mb-2">视频提示词:</div>
                                             <p className="bg-black p-2 rounded border border-gray-800">{fusionImg.prompt}</p>
                                         </div>
                                         <div className="p-4 flex flex-col gap-3 justify-center items-center">
                                             <button className="text-xs text-gray-400 hover:text-white flex items-center gap-1"><Icons.Download size={14}/> 下载</button>
                                             <button onClick={() => openVideoEditModal(fusionImg)} className="text-xs text-pink-500 hover:text-pink-400 font-bold flex items-center gap-1"><Icons.Wand2 size={14}/> 编辑</button>
                                             <button onClick={() => setDubbingModalOpen(true)} className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"><Icons.Mic size={14}/> 配音</button>
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>
                        {editingVideoItem && (
                            <Modal title="重新生成 / 编辑视频" onClose={() => setEditingVideoItem(null)} size="lg">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-bold text-white mb-2 block">模型</label>
                                            <select className="w-full bg-black border border-spark-border rounded p-2 text-white text-sm" value={editVideoSettings.model} onChange={e => setEditVideoSettings({...editVideoSettings, model: e.target.value as AiModel})}>
                                                {Object.values(AiModel).map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-white mb-2 block">时长</label>
                                            <select className="w-full bg-black border border-spark-border rounded p-2 text-white text-sm" value={editVideoSettings.duration} onChange={e => setEditVideoSettings({...editVideoSettings, duration: e.target.value})}>
                                                <option value="5s">5s</option><option value="10s">10s</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                         <div>
                                            <label className="text-sm font-bold text-white mb-2 block">分辨率</label>
                                            <select className="w-full bg-black border border-spark-border rounded p-2 text-white text-sm" value={editVideoSettings.resolution} onChange={e => setEditVideoSettings({...editVideoSettings, resolution: e.target.value})}>
                                                <option value="1080p">1080p</option><option value="720p">720p</option>
                                            </select>
                                        </div>
                                         <div>
                                            <label className="text-sm font-bold text-white mb-2 block">生成数量</label>
                                            <select className="w-full bg-black border border-spark-border rounded p-2 text-white text-sm" value={editVideoSettings.count} onChange={e => setEditVideoSettings({...editVideoSettings, count: parseInt(e.target.value)})}>
                                                <option value={1}>1</option><option value={2}>2</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-white mb-2 block">图生视频提示词</label>
                                        <textarea 
                                            className="w-full h-32 bg-black border border-spark-border rounded p-3 text-white text-sm resize-none focus:border-spark-accent outline-none"
                                            value={editVideoSettings.prompt}
                                            onChange={e => setEditVideoSettings({...editVideoSettings, prompt: e.target.value})}
                                        />
                                        <div className="text-xs text-gray-500 mt-2">修改提示词将基于当前已确认的图片素材生成新的视频片段。</div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4 border-t border-spark-border">
                                        <button onClick={() => setEditingVideoItem(null)} className="px-6 py-2 rounded-lg border border-gray-600 text-gray-300 hover:text-white">取消</button>
                                        <button onClick={handleRegenerateVideo} className="px-8 py-2 rounded-lg bg-spark-accent text-black font-bold hover:bg-spark-accentHover flex items-center gap-2">
                                            <Icons.RotateCcw size={16}/> 重新生成
                                        </button>
                                    </div>
                                </div>
                            </Modal>
                        )}
                        {dubbingModalOpen && (
                            <Modal title="添加配音" onClose={() => setDubbingModalOpen(false)}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border-2 border-dashed border-gray-600 rounded-xl h-32 flex flex-col items-center justify-center hover:border-spark-accent cursor-pointer text-gray-400 hover:text-white">
                                            <Icons.Upload size={24} className="mb-2"/>
                                            上传音频文件
                                        </div>
                                        <div className="border border-spark-border rounded-xl p-4 bg-gray-900">
                                            <div className="text-sm font-bold text-white mb-2">AI 配音生成</div>
                                            <select className="w-full bg-black border border-gray-700 rounded p-2 text-sm text-white mb-2"><option>成熟男声</option><option>活力女声</option></select>
                                            <textarea className="w-full bg-black border border-gray-700 rounded p-2 text-sm text-white h-16 resize-none" placeholder="输入台词..."/>
                                        </div>
                                    </div>
                                    <button className="w-full bg-spark-accent text-black py-2 rounded font-bold" onClick={() => setDubbingModalOpen(false)}>确认添加</button>
                                </div>
                            </Modal>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ... (SnippetEditor, ProjectDetailView, ManjuListView, IpLibraryView, CourseListView, CreatorHallOfFameView, HomeView, TaskDetailModal, TaskWallView, TrafficView components unchanged) ...
// ... (Including SnippetEditor etc for completeness) ...
const SnippetEditor = ({ snippet, project, onBack }: { snippet: Snippet, project: Project, onBack: () => void }) => {
    // ... (Existing SnippetEditor implementation)
    const [mode, setMode] = useState<CreationMode>(snippet.mode || CreationMode.IMAGE_TO_VIDEO);
    const [model, setModel] = useState(AiModel.WAN_2_5);
    const [shotType, setShotType] = useState<ShotType>(ShotType.DIALOGUE);
    const [prompt, setPrompt] = useState(snippet.description || '');
    const [duration, setDuration] = useState('5s');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [count, setCount] = useState('1');
    const [isGenerating, setIsGenerating] = useState(false);
    const [history, setHistory] = useState<any[]>([]); 
    const [selectedCharId, setSelectedCharId] = useState<string|null>(null);
    const [selectedSceneId, setSelectedSceneId] = useState<string|null>(null);
    const [selectedPropId, setSelectedPropId] = useState<string|null>(null);
    const mainInputRef = useRef<HTMLInputElement>(null);
    const poseInputRef = useRef<HTMLInputElement>(null);
    const effectInputRef = useRef<HTMLInputElement>(null);
    const [mainImage, setMainImage] = useState<string|null>(null);
    const [poseImage, setPoseImage] = useState<string|null>(null);
    const [effectImage, setEffectImage] = useState<string|null>(null);

    const handleGenerate = () => {
        setIsGenerating(true);
        const newTask = {
            id: Date.now(),
            status: 'Generating',
            timestamp: new Date().toLocaleTimeString(),
            preview: 'https://picsum.photos/400/225?blur=5'
        };
        setHistory([newTask, ...history]);
        setTimeout(() => {
            const finishedTask = {
                ...newTask,
                status: 'Completed',
                preview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            };
            setHistory(prev => [finishedTask, ...prev.filter(t => t.id !== newTask.id)]);
            setIsGenerating(false);
        }, 4000);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (s:string)=>void) => {
        if (e.target.files?.[0]) {
            setPreview(URL.createObjectURL(e.target.files[0]));
        }
    }

    const handleAiOptimize = async () => {
        if (!prompt) return;
        const optimized = await optimizeVideoPrompt(prompt);
        setPrompt(optimized);
    };

    return (
        <div className="h-full flex flex-col bg-black">
            <div className="h-16 border-b border-spark-border flex items-center justify-between px-6 bg-spark-surface shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-black rounded-full text-gray-400 hover:text-white"><Icons.ChevronLeft/></button>
                    <h2 className="text-lg font-bold text-white">{snippet.name}</h2>
                </div>
                <div className="flex bg-black p-1 rounded-lg border border-spark-border">
                    {[CreationMode.IMAGE_TO_VIDEO, CreationMode.FIRST_LAST_FRAME, CreationMode.FUSION].map(m => (
                        <button key={m} onClick={() => setMode(m)} className={`px-4 py-1.5 text-sm rounded transition-all ${mode === m ? 'bg-spark-accent text-black font-bold' : 'text-gray-400 hover:text-white'}`}>{m}</button>
                    ))}
                </div>
                <button className="bg-spark-accent text-black font-bold px-4 py-1.5 rounded text-sm">导出视频</button>
            </div>
            <div className="flex-1 flex overflow-hidden">
                <div className="w-1/2 bg-spark-card border-r border-spark-border flex flex-col p-6 overflow-y-auto scrollbar-thin">
                    <div className="space-y-6 max-w-2xl mx-auto w-full">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">镜头类型</label>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.values(ShotType).map(t => (
                                    <button key={t} onClick={() => setShotType(t)} className={`text-xs py-2 rounded border transition-all ${shotType === t ? 'border-spark-accent text-spark-accent bg-spark-accent/10 font-bold shadow-[0_0_10px_rgba(251,191,36,0.1)]' : 'border-spark-border text-gray-400 hover:border-gray-500'}`}>{t}</button>
                                ))}
                            </div>
                        </div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-2 block">AI模型</label><select className="w-full bg-black border border-spark-border rounded p-2 text-white text-sm focus:border-spark-accent outline-none" value={model} onChange={e => setModel(e.target.value as AiModel)}>{Object.values(AiModel).map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                        <div className="space-y-4 p-4 bg-black/30 rounded-xl border border-spark-border/50">
                            <AssetSelector title="选择角色" items={project.characters} selectedId={selectedCharId} onSelect={setSelectedCharId} emptyText="不使用角色"/>
                            <AssetSelector title="选择场景" items={project.scenes} selectedId={selectedSceneId} onSelect={setSelectedSceneId} emptyText="不使用场景"/>
                            <AssetSelector title="选择物品" items={project.props} selectedId={selectedPropId} onSelect={setSelectedPropId} emptyText="不使用物品"/>
                        </div>
                        {mode === CreationMode.IMAGE_TO_VIDEO && (
                            <div className="grid grid-cols-3 gap-4">
                                <div onClick={() => mainInputRef.current?.click()} className={`border-2 border-dashed rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer text-center p-2 relative overflow-hidden group ${mainImage ? 'border-spark-accent' : 'border-spark-border hover:border-spark-accent'}`}>
                                    <input type="file" ref={mainInputRef} className="hidden" onChange={e => handleFileSelect(e, setMainImage)} accept="image/*"/>
                                    {mainImage ? <img src={mainImage} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100"/> : <><Icons.ImagePlus size={20} className="text-gray-500 group-hover:text-spark-accent"/><span className="text-[10px] mt-1 text-gray-500 group-hover:text-white">主参考图 (点击上传)</span></>}
                                </div>
                                <div onClick={() => poseInputRef.current?.click()} className={`border-2 border-dashed rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer text-center p-2 relative overflow-hidden group ${poseImage ? 'border-spark-accent' : 'border-spark-border hover:border-spark-accent'}`}>
                                    <input type="file" ref={poseInputRef} className="hidden" onChange={e => handleFileSelect(e, setPoseImage)} accept="image/*"/>
                                    {poseImage ? <img src={poseImage} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100"/> : <><Icons.User size={20} className="text-gray-500 group-hover:text-spark-accent"/><span className="text-[10px] mt-1 text-gray-500 group-hover:text-white">姿态参考 (可选)</span></>}
                                </div>
                                <div onClick={() => effectInputRef.current?.click()} className={`border-2 border-dashed rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer text-center p-2 relative overflow-hidden group ${effectImage ? 'border-spark-accent' : 'border-spark-border hover:border-spark-accent'}`}>
                                    <input type="file" ref={effectInputRef} className="hidden" onChange={e => handleFileSelect(e, setEffectImage)} accept="image/*"/>
                                    {effectImage ? <img src={effectImage} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100"/> : <><Icons.Wand2 size={20} className="text-gray-500 group-hover:text-spark-accent"/><span className="text-[10px] mt-1 text-gray-500 group-hover:text-white">特效参考 (可选)</span></>}
                                </div>
                            </div>
                        )}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">视频提示词</label>
                                <button onClick={handleAiOptimize} className="text-xs text-spark-accent flex items-center gap-1 hover:text-white transition-colors bg-spark-accent/10 px-2 py-1 rounded"><Icons.Wand2 size={12}/> AI 一键优化</button>
                            </div>
                            <textarea className="w-full h-32 bg-black border border-spark-border rounded-lg p-3 text-white text-sm resize-none focus:border-spark-accent outline-none" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="描述视频中的动作、光影、氛围..."/>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <RadioGroup label="时长" options={['3s', '5s', '10s']} value={duration} onChange={setDuration} />
                            <RadioGroup label="画面比例" options={['16:9', '9:16', '1:1', '2.35:1']} value={aspectRatio} onChange={setAspectRatio} />
                            <RadioGroup label="生成数量" options={['1', '2', '4']} value={count} onChange={setCount} />
                        </div>
                        <button onClick={handleGenerate} disabled={isGenerating} className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 text-lg shadow-lg ${isGenerating ? 'bg-gray-800 text-gray-500' : 'bg-gradient-to-r from-spark-accent to-yellow-600 text-black hover:scale-[1.01] transition-transform'}`}>
                             {isGenerating ? <Icons.Flame className="animate-spin"/> : <Icons.Video size={20}/>} {isGenerating ? '正在生成...' : '立即生成视频'}
                        </button>
                    </div>
                </div>
                <div className="w-1/2 bg-black p-6 flex flex-col gap-6 overflow-hidden">
                    <div className="flex-1 bg-spark-surface border border-spark-border rounded-2xl overflow-hidden relative flex flex-col">
                        <div className="p-4 border-b border-spark-border bg-black/40 flex justify-between items-center">
                            <h3 className="text-white font-bold flex items-center gap-2"><Icons.Layers size={16} className="text-spark-accent"/> 生成任务列表</h3>
                            <div className="text-xs text-gray-500">History</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4 content-start">
                             {isGenerating && (
                                 <div className="aspect-video bg-gray-900 rounded-xl border border-spark-accent/50 p-4 flex flex-col items-center justify-center relative overflow-hidden animate-pulse">
                                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-spark-accent/5 to-transparent skew-x-12 animate-shimmer"></div>
                                     <Icons.Flame size={32} className="text-spark-accent animate-spin mb-2"/>
                                     <span className="text-spark-accent text-sm font-bold">正在生成中...</span>
                                     <span className="text-xs text-gray-500 mt-1">预计剩余 12s</span>
                                 </div>
                             )}
                             {history.length > 0 ? history.map((task) => (
                                 <div key={task.id} className="aspect-video bg-gray-900 rounded-xl border border-spark-border overflow-hidden relative group">
                                     {task.status === 'Completed' ? (
                                         <>
                                            <video src={task.preview} className="w-full h-full object-cover" autoPlay muted loop/>
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button className="p-2 bg-spark-accent rounded-full text-black hover:scale-110 transition-transform"><Icons.Play size={20} fill="black"/></button>
                                                <button className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40"><Icons.Share size={20}/></button>
                                            </div>
                                            <div className="absolute top-2 right-2 bg-green-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded">Completed</div>
                                         </>
                                     ) : (
                                         <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                                             <Icons.Clock size={24} className="mb-2"/>
                                             <span>Waiting...</span>
                                         </div>
                                     )}
                                     <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                         <div className="text-[10px] text-gray-400">{task.timestamp}</div>
                                     </div>
                                 </div>
                             )) : (
                                 !isGenerating && (
                                     <div className="col-span-2 h-64 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl">
                                         <Icons.Film size={48} className="mb-4 opacity-20"/>
                                         <p>暂无生成记录</p>
                                     </div>
                                 )
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... (Other existing view components) ...
const ProjectDetailView = ({ project, onBack, onEditSnippet, onCreateScriptVideo }: { project: Project, onBack: () => void, onEditSnippet: (s: Snippet) => void, onCreateScriptVideo: () => void }) => {
    // ... (Existing ProjectDetailView implementation)
    const [activeTab, setActiveTab] = useState<ProjectTab>(ProjectTab.SEGMENTS);
    const [editingAssetType, setEditingAssetType] = useState<'Character' | 'Scene' | 'Prop' | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    if (editingAssetType) {
        return <AssetEditor type={editingAssetType} project={project} onSave={(newAsset) => {
            if (editingAssetType === 'Character') project.characters.push(newAsset);
            else if (editingAssetType === 'Scene') project.scenes.push(newAsset);
            else if (editingAssetType === 'Prop') project.props.push(newAsset);
            setEditingAssetType(null);
        }} onCancel={() => setEditingAssetType(null)}/>;
    }

    const handleCreateClick = () => {
        setShowCreateModal(true);
    };

    const handleCreateSnippet = (mode: CreationMode) => {
        setShowCreateModal(false);
        if (mode === CreationMode.SCRIPT_TO_VIDEO) {
            onCreateScriptVideo();
        } else {
            const newSnippet: Snippet = { id: `s${Date.now()}`, projectId: project.id, name: `片段 ${project.snippets.length + 1}`, description: '', status: 'Draft', createdAt: new Date().toLocaleDateString(), mode: mode };
            onEditSnippet(newSnippet);
        }
    };

    return (
        <div className="h-full flex flex-col bg-spark-bg">
            <div className="h-16 border-b border-spark-border flex items-center px-6 bg-spark-surface justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-400 hover:text-white"><Icons.ChevronLeft/></button>
                    <h2 className="text-xl font-bold text-white">{project.title}</h2>
                    <span className="px-2 py-0.5 rounded border border-gray-700 text-gray-400 text-xs">{project.status}</span>
                </div>
                <div className="flex gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Icons.Clock size={14}/> {project.lastModified}</span>
                </div>
            </div>
            <div className="flex border-b border-spark-border px-6 bg-spark-surface/50">
                {[
                    { id: ProjectTab.SEGMENTS, label: '分镜片段', icon: Icons.Layers },
                    { id: ProjectTab.CHARACTERS, label: '角色管理', icon: Icons.User },
                    { id: ProjectTab.SCENES, label: '场景管理', icon: Icons.Image },
                    { id: ProjectTab.PROPS, label: '物品管理', icon: Icons.Box },
                    // Fusion and Repaint tabs removed as per previous request
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as ProjectTab)} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-spark-accent text-spark-accent' : 'border-transparent text-gray-400 hover:text-white'}`}>
                        <tab.icon size={16}/> {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-black">
                {activeTab === ProjectTab.SEGMENTS && (
                    <div className="grid grid-cols-4 gap-6">
                        <button onClick={handleCreateClick} className="aspect-video border-2 border-dashed border-spark-border rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-spark-accent transition-all">
                            <Icons.Plus size={32} className="mb-2"/> <span className="font-bold">新建分镜</span>
                        </button>
                        {project.snippets.map(s => (
                            <div key={s.id} onClick={() => onEditSnippet(s)} className="bg-spark-card border border-spark-border rounded-xl overflow-hidden hover:border-spark-accent cursor-pointer group">
                                <div className="aspect-video bg-gray-800 relative">
                                    {s.thumbnail ? <img src={s.thumbnail} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-600"><Icons.Video size={32}/></div>}
                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded text-xs text-white backdrop-blur">{s.mode}</div>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-white text-sm truncate">{s.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{s.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {(activeTab === ProjectTab.CHARACTERS || activeTab === ProjectTab.SCENES || activeTab === ProjectTab.PROPS) && (
                    <div className="grid grid-cols-5 gap-6">
                        <button onClick={() => setEditingAssetType(activeTab === ProjectTab.CHARACTERS ? 'Character' : activeTab === ProjectTab.SCENES ? 'Scene' : 'Prop')} className="aspect-[3/4] border-2 border-dashed border-spark-border rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-spark-accent transition-all">
                            <Icons.Plus size={32} className="mb-2"/> <span className="font-bold">新建{activeTab === ProjectTab.CHARACTERS ? '角色' : activeTab === ProjectTab.SCENES ? '场景' : '物品'}</span>
                        </button>
                        {(activeTab === ProjectTab.CHARACTERS ? project.characters : activeTab === ProjectTab.SCENES ? project.scenes : project.props).map((item: any) => (
                            <div key={item.id} onClick={() => setEditingAssetType(activeTab === ProjectTab.CHARACTERS ? 'Character' : activeTab === ProjectTab.SCENES ? 'Scene' : 'Prop')} className="aspect-[3/4] bg-spark-card border border-spark-border rounded-xl relative group cursor-pointer overflow-hidden">
                                <img src={item.previewImage || item.image} className="w-full h-full object-cover transition-transform group-hover:scale-105"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <h3 className="font-bold text-white">{item.name}</h3>
                                    <p className="text-xs text-gray-300">{item.model}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {showCreateModal && (
                <Modal title="选择创作模式" onClose={() => setShowCreateModal(false)} size="md">
                    <div className="grid grid-cols-2 gap-4">
                        <div onClick={() => handleCreateSnippet(CreationMode.IMAGE_TO_VIDEO)} className="bg-spark-card border border-spark-border p-6 rounded-xl hover:border-spark-accent cursor-pointer flex flex-col items-center text-center transition-all hover:bg-spark-surface">
                            <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-400"><Icons.ImagePlus size={32}/></div>
                            <h3 className="font-bold text-white mb-2">按图生视频</h3>
                            <p className="text-xs text-gray-500">上传参考图或使用已有资产，通过提示词生成视频片段。</p>
                        </div>
                        <div onClick={() => handleCreateSnippet(CreationMode.SCRIPT_TO_VIDEO)} className="bg-spark-card border border-spark-border p-6 rounded-xl hover:border-spark-accent cursor-pointer flex flex-col items-center text-center transition-all hover:bg-spark-surface">
                            <div className="w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center mb-4 text-purple-400"><Icons.BookOpen size={32}/></div>
                            <h3 className="font-bold text-white mb-2">按剧本生视频</h3>
                            <p className="text-xs text-gray-500">全流程 AI 辅助，从剧本拆解、分镜设计到最终视频生成。</p>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const ManjuListView = ({ onBack, onPlay }: { onBack: () => void, onPlay: (url: string) => void }) => {
    // ... (Existing ManjuListView implementation)
    return (
        <div className="w-full p-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 bg-spark-surface rounded-full text-gray-400 hover:text-white"><Icons.ChevronLeft/></button>
                <h2 className="text-2xl font-bold text-white">热门漫剧</h2>
            </div>
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {['最新更新', '播放量 Top', '收入排行'].map(f => (
                    <button key={f} className={`px-4 py-2 rounded-lg border text-sm font-bold whitespace-nowrap ${f==='最新更新'?'bg-spark-accent text-black border-spark-accent':'bg-transparent border-spark-border text-gray-400 hover:text-white'}`}>{f}</button>
                ))}
                <div className="w-px bg-spark-border mx-2"></div>
                {['全部', '科幻', '玄幻', '都市', '悬疑'].map(t => (
                    <button key={t} className="px-4 py-2 rounded-lg border border-spark-border text-gray-400 text-sm hover:text-white">{t}</button>
                ))}
            </div>
            <div className="grid grid-cols-4 gap-6">
                {MOCK_COMICS.map(c => (
                    <div key={c.id} onClick={() => onPlay(c.videoUrl)} className="bg-spark-card border border-spark-border rounded-xl overflow-hidden group cursor-pointer hover:border-spark-accent transition-all relative">
                         <div className="aspect-[3/4] relative overflow-hidden">
                             <img src={c.cover} className="w-full h-full object-cover transition-transform group-hover:scale-105"/>
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                 <Icons.Play size={48} className="text-white fill-white"/>
                             </div>
                             <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white flex items-center gap-1"><Icons.Video size={10}/> {c.views > 10000 ? (c.views/10000).toFixed(1)+'w' : c.views}</div>
                         </div>
                         <div className="p-4">
                             <h3 className="font-bold text-white truncate mb-1">{c.title}</h3>
                             <div className="flex justify-between items-center text-xs text-gray-500">
                                 <span>{c.author}</span>
                                 <span className="text-spark-accent">¥{(c.revenue/10000).toFixed(1)}w 收益</span>
                             </div>
                             <div className="mt-2 flex gap-1">
                                 {c.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px] text-gray-400">{t}</span>)}
                             </div>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const IpLibraryView = ({ onBack }: { onBack: () => void }) => {
    // ... (Existing IpLibraryView implementation)
    return (
        <div className="w-full p-8">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 bg-spark-surface rounded-full text-gray-400 hover:text-white"><Icons.ChevronLeft/></button>
                <h2 className="text-2xl font-bold text-white">全球 IP 库</h2>
            </div>
            <div className="grid grid-cols-4 gap-6">
                {MOCK_IPS.map(ip => (
                    <div key={ip.id} className="bg-spark-card border border-spark-border rounded-xl overflow-hidden group hover:border-spark-accent transition-all relative flex flex-col">
                        <div className="aspect-[2/3] relative">
                            <img src={ip.cover} className="w-full h-full object-cover"/>
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">{ip.platform}</div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-white text-lg mb-1">{ip.title}</h3>
                            <p className="text-sm text-gray-400 mb-2">{ip.author}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{ip.description}</p>
                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-spark-border">
                                <div className="text-spark-accent font-bold">{ip.price} 积分</div>
                                {ip.isPurchased ? (
                                    <button className="px-4 py-2 bg-gray-800 text-gray-400 text-xs font-bold rounded cursor-default">已授权</button>
                                ) : (
                                    <button className="px-4 py-2 bg-spark-accent text-black text-xs font-bold rounded hover:bg-spark-accentHover">购买授权</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CourseListView = ({ onBack }: { onBack: () => void }) => {
    // ... (Existing CourseListView implementation)
    return (
         <div className="w-full p-8">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 bg-spark-surface rounded-full text-gray-400 hover:text-white"><Icons.ChevronLeft/></button>
                <h2 className="text-2xl font-bold text-white">课程指导</h2>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {MOCK_COURSES.map(c => (
                    <div key={c.id} className="bg-spark-card border border-spark-border rounded-xl overflow-hidden hover:border-spark-accent transition-all cursor-pointer group">
                        <div className="aspect-video relative">
                            <img src={c.cover} className="w-full h-full object-cover"/>
                            <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white ${c.status==='Ongoing'?'bg-green-600':c.status==='Pending'?'bg-blue-600':'bg-gray-600'}`}>{c.status === 'Ongoing' ? '进行中' : c.status === 'Pending' ? '待开始' : '已结束'}</div>
                            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white border border-white/20">{c.type === 'Online' ? '线上课' : '线下营'}</div>
                        </div>
                        <div className="p-4">
                             <div className="flex items-center gap-2 mb-2">
                                 <span className={`text-[10px] px-1.5 py-0.5 rounded border ${c.level === UserLevel.CORE ? 'border-red-500 text-red-500' : c.level === UserLevel.ELITE ? 'border-yellow-500 text-yellow-500' : 'border-blue-500 text-blue-500'}`}>{c.level} Member</span>
                                 <span className="text-xs text-gray-500">{c.date}</span>
                             </div>
                             <h3 className="font-bold text-white text-lg mb-2 group-hover:text-spark-accent transition-colors">{c.title}</h3>
                             <p className="text-sm text-gray-400">讲师: {c.instructor}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ... (Other View components TaskDetailModal, TaskWallView, TrafficView, etc) ...

// --- REPLACED INCUBATOR VIEW ---

const ActivityDetail = ({ activity, onBack }: { activity: any, onBack: () => void }) => (
    <div className="h-full overflow-y-auto bg-black p-8 text-white">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
            <Icons.ChevronLeft /> 返回列表
        </button>
        <div className="max-w-4xl mx-auto">
            <div className="aspect-video rounded-2xl overflow-hidden mb-8 relative">
                <img src={activity.img} className="w-full h-full object-cover"/>
                <div className="absolute top-4 right-4 bg-spark-accent text-black font-bold px-4 py-1 rounded-full">
                    {activity.status}
                </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">{activity.title}</h1>
            <div className="flex gap-3 mb-8">
                {activity.tags.map((t: string) => (
                    <span key={t} className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">{t}</span>
                ))}
            </div>
            
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-8">
                    <section className="bg-spark-card border border-spark-border p-6 rounded-xl">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Icons.Info className="text-spark-accent"/> 活动详情</h2>
                        <p className="text-gray-400 leading-relaxed">
                            {activity.description || "本次大赛旨在挖掘全球优秀的AI视频创作者，通过元极AI造境平台，释放你的无限创意。参赛者将有机会获得丰厚现金奖励，并签约成为平台核心创作者，获得千万级流量扶持。"}
                        </p>
                        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                            <h3 className="font-bold mb-2">参赛要求</h3>
                            <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                                <li>使用 Sparkreel 提供的 AI 工具进行创作</li>
                                <li>视频时长不低于 30 秒</li>
                                <li>拥有完整版权</li>
                            </ul>
                        </div>
                    </section>
                </div>
                <div className="col-span-1">
                     <div className="bg-spark-card border border-spark-border p-6 rounded-xl sticky top-8">
                        <div className="mb-6">
                            <div className="text-gray-500 text-sm mb-1">距离截止还有</div>
                            <div className="text-2xl font-bold text-white font-mono">12天 08:45:22</div>
                        </div>
                        <button className="w-full bg-spark-accent text-black font-bold py-3 rounded-lg hover:bg-spark-accentHover mb-4">
                            立即报名
                        </button>
                        <button className="w-full border border-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-800">
                            查看详细规则
                        </button>
                     </div>
                </div>
            </div>
        </div>
    </div>
);

const CourseDetail = ({ course, onBack }: { course: any, onBack: () => void }) => (
    <div className="h-full overflow-y-auto bg-black p-8 text-white">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
            <Icons.ChevronLeft /> 返回列表
        </button>
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8">
            <div className="col-span-2">
                 <div className="aspect-video rounded-xl overflow-hidden mb-6">
                     <img src={course.img} className="w-full h-full object-cover"/>
                 </div>
                 <div className="bg-spark-card border border-spark-border p-6 rounded-xl mb-6">
                     <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
                     <p className="text-gray-400 mb-4">{course.subtitle || "系统化掌握 AI 创作核心技能，从入门到精通"}</p>
                     <div className="flex items-center gap-4 text-sm text-gray-500">
                         <span className="flex items-center gap-1"><Icons.User size={14}/> {course.instructor}</span>
                         <span>|</span>
                         <span className="flex items-center gap-1"><Icons.BookOpen size={14}/> {course.lessons || 12} 节课</span>
                     </div>
                 </div>
                 
                 <div className="bg-spark-card border border-spark-border p-6 rounded-xl">
                     <h3 className="font-bold text-lg mb-4">课程大纲</h3>
                     <div className="space-y-2">
                         {[1,2,3,4,5].map(i => (
                             <div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 rounded hover:bg-gray-900 cursor-pointer">
                                 <div className="flex items-center gap-3">
                                     <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">{i}</div>
                                     <span className="text-gray-300">第 {i} 章：AI 创作基础与实战案例解析 {i}</span>
                                 </div>
                                 <Icons.Play size={14} className="text-gray-600"/>
                             </div>
                         ))}
                     </div>
                 </div>
            </div>
            
            <div className="col-span-1">
                <div className="bg-spark-card border border-spark-border p-6 rounded-xl sticky top-8">
                    <div className="flex items-end gap-2 mb-6">
                        <span className="text-3xl font-bold text-orange-500">¥{course.price}</span>
                        {course.oldPrice > 0 && <span className="text-sm text-gray-500 line-through mb-1">¥{course.oldPrice}</span>}
                    </div>
                    <ul className="space-y-3 mb-6 text-sm text-gray-400">
                        <li className="flex gap-2"><Icons.Check size={16} className="text-spark-accent"/> 永久回放权限</li>
                        <li className="flex gap-2"><Icons.Check size={16} className="text-spark-accent"/> 课后实战作业批改</li>
                        <li className="flex gap-2"><Icons.Check size={16} className="text-spark-accent"/> 专属学员交流群</li>
                    </ul>
                    <button className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 mb-3">
                        立即购买
                    </button>
                    <button className="w-full border border-gray-600 text-gray-300 font-bold py-3 rounded-lg hover:bg-gray-800">
                        试看课程
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const IncubatorView = () => {
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const BANNERS = {
    main: { title: '2025元极AI造境大赛', subtitle: '全球首届AI电影 x 品牌营销盛典', img: 'https://image.pollinations.ai/prompt/futuristic%203d%20typography%202025%20AI%20film%20festival%20award%20ceremony%20stage%20cinematic%20lighting%20gold%20and%20black%20elegant%20high%20tech%20background?width=1200&height=800&nologo=true' }, 
    side: [
      { title: 'Suno在线音乐创作', subtitle: '限时免费 一键成为音乐人', img: 'https://image.pollinations.ai/prompt/music%20production%20studio%20interface%20with%20floating%20musical%20notes%20and%20sound%20waves%20colorful%20neon%20illustration?width=400&height=400&nologo=true', bg: 'bg-gradient-to-br from-orange-400 to-red-500' },
      { title: 'Banana 2.0 正式上线', subtitle: '全新升级，超乎想象', img: 'https://image.pollinations.ai/prompt/3d%20render%20of%20a%20stylized%20yellow%20banana%20with%20futuristic%20cybernetic%20parts%20glowing%20blue%20lines%20dark%20background?width=400&height=400&nologo=true', bg: 'bg-blue-900' }
    ]
  };

  const ACTIVITIES = [
    { 
        id: 1, 
        title: 'AI造梦节—浙西大学生AIGC视频创意大赛', 
        status: '进行中', 
        img: 'https://image.pollinations.ai/prompt/poster%20for%20AI%20video%20creation%20contest%20featuring%20university%20students%20cyberpunk%20camera%20future%20film%20set?width=600&height=400&nologo=true', 
        tags: ['AI视频创作', 'AI创作大赛', '现金奖'] 
    },
    { 
        id: 2, 
        title: '2025骁龙 AI人工智能创新应用大赛', 
        status: '进行中', 
        img: 'https://image.pollinations.ai/prompt/technological%20poster%20snapdragon%20processor%20ai%20chip%20glowing%20blue%20neural%20networks%20innovation%20contest?width=600&height=400&nologo=true', 
        tags: ['现金奖', '技术支持'] 
    },
    { 
        id: 3, 
        title: '浙阿历史经典 (非遗) 产业共创大赛', 
        status: '已结束', 
        img: 'https://image.pollinations.ai/prompt/traditional%20chinese%20intangible%20cultural%20heritage%20golden%20artifacts%20museum%20exhibition%20poster%20elegant?width=600&height=400&nologo=true', 
        tags: ['现金奖', '文化传承'] 
    }
  ];

  const FEATURED_COURSE = { 
      title: '199学10门 AI 应用课', 
      subtitle: '200+ 实操视频 案例讲解 名师带路', 
      price: 199, 
      oldPrice: 334, 
      img: 'https://image.pollinations.ai/prompt/vertical%20poster%20design%20for%20ai%20course%20robot%20teaching%20human%20futuristic%20blue%20and%20orange%20style?width=400&height=600&nologo=true' 
  };
  
  const SUB_COURSES = [
    { title: '人人都是Prompt工程师', instructor: '北冥', lessons: 15, price: 29, oldPrice: 68, img: 'https://image.pollinations.ai/prompt/book%20cover%20design%20prompt%20engineer%20guide%20minimalist%20tech%20style?width=300&height=400&nologo=true' },
    { title: '网易云课堂AI绘画2天直播训练营', instructor: '超人', lessons: 2, price: 0, oldPrice: 99, img: 'https://image.pollinations.ai/prompt/vertical%20course%20poster%20digital%20art%20painting%20class?width=300&height=400&nologo=true' },
    { title: 'AI 漫画就业培训营', instructor: '系统课', lessons: 40, price: 5980, oldPrice: 5980, img: 'https://image.pollinations.ai/prompt/manga%20tutorial%20book%20cover%20anime%20style?width=300&height=400&nologo=true' },
    { title: 'AI 应用实战课', instructor: '黄佳', lessons: 25, price: 59, oldPrice: 99, img: 'https://image.pollinations.ai/prompt/vertical%20business%20tech%20course%20poster%20ai%20application?width=300&height=400&nologo=true' },
    { title: 'AI 大模型微调训练营', instructor: '高手带路', lessons: 0, price: 3299, oldPrice: 3299, img: 'https://image.pollinations.ai/prompt/vertical%20poster%20server%20room%20neural%20network%20training?width=300&height=400&nologo=true' },
    { title: 'AI 大模型企业应用实战', instructor: '蔡超', lessons: 0, price: 59, oldPrice: 99, img: 'https://image.pollinations.ai/prompt/vertical%20poster%20corporate%20ai%20strategy?width=300&height=400&nologo=true' },
  ];

  const COURSE_CATEGORIES = [
    { id: 'hot', label: '热门课程', icon: Icons.Flame, active: true },
    { id: 'free', label: '免费课程', icon: Icons.Gift }, 
    { id: 'live', label: '直播课程', icon: Icons.Video },
    { id: 'basic', label: '零基础课程', icon: Icons.BookOpen },
  ];

  // Updated CREATORS with requested fields: Works, Orders, Revenue, Level
  const CREATORS = [
    { name: '重光', role: '实战派AI玩家', works: 45, orders: 12, revenue: 35800, level: UserLevel.CORE, avatar: 'https://picsum.photos/id/100/100/100' },
    { name: '涟西', role: '1年半AI绘画经验', works: 32, orders: 8, revenue: 12500, level: UserLevel.ELITE, avatar: 'https://picsum.photos/id/101/100/100' },
    { name: '沫沫来了', role: 'AI绘图师', works: 54, orders: 20, revenue: 58000, level: UserLevel.CORE, avatar: 'https://picsum.photos/id/102/100/100' },
    { name: '梦罗浮', role: '会用AI电影制作流程', works: 12, orders: 3, revenue: 4500, level: UserLevel.BASIC, avatar: 'https://picsum.photos/id/103/100/100' },
    { name: '用户_0825', role: '导演、编剧、剪辑', works: 8, orders: 1, revenue: 1200, level: UserLevel.BASIC, avatar: 'https://picsum.photos/id/104/100/100' },
    { name: '同济子豪兄', role: '张子豪, B站UP主', works: 5, orders: 2, revenue: 3000, level: UserLevel.ELITE, avatar: 'https://picsum.photos/id/105/100/100' },
    { name: '雪天狗', role: '雪天狗 《汉唐盛世...》', works: 88, orders: 42, revenue: 120000, level: UserLevel.CORE, avatar: 'https://picsum.photos/id/106/100/100' },
    { name: '秦俑AI研究所', role: 'AIGC深度爱好者', works: 15, orders: 5, revenue: 6800, level: UserLevel.ELITE, avatar: 'https://picsum.photos/id/107/100/100' },
  ];

  if (selectedActivity) return <ActivityDetail activity={selectedActivity} onBack={() => setSelectedActivity(null)} />;
  if (selectedCourse) return <CourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} />;

  return (
    <div className="h-full overflow-y-auto bg-black w-full text-white">
       {/* 1. Banner Wall */}
       <div className="p-8 pb-0">
          <div className="grid grid-cols-4 gap-6 h-[380px]">
              <div className="col-span-3 relative rounded-2xl overflow-hidden group cursor-pointer">
                  <img src={BANNERS.main.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                      <h1 className="text-5xl font-bold text-yellow-500 mb-2 italic tracking-tighter" style={{fontFamily: 'impact'}}>2025 元极AI造境大赛</h1>
                      <p className="text-xl text-white font-bold">全球首届AI电影 x 品牌营销盛典</p>
                      <div className="mt-4 flex gap-4">
                          <img src="https://placehold.co/100x40/white/black?text=LOGO1" className="h-8 opacity-70"/>
                          <img src="https://placehold.co/100x40/white/black?text=LOGO2" className="h-8 opacity-70"/>
                      </div>
                  </div>
              </div>
              <div className="col-span-1 flex flex-col gap-6">
                  {BANNERS.side.map((b, i) => (
                      <div key={i} className={`flex-1 rounded-2xl overflow-hidden relative cursor-pointer group ${b.bg}`}>
                          <div className="absolute inset-0 p-6 z-10 flex flex-col justify-center">
                              <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{b.title}</h3>
                              <p className="text-xs text-white/90 mb-4 drop-shadow">{b.subtitle}</p>
                              <button className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full w-fit hover:bg-gray-100">立即进入</button>
                          </div>
                          <img src={b.img} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"/>
                      </div>
                  ))}
              </div>
          </div>
          
          {/* Removed App Square as per previous request */}
       </div>

       {/* 2. AI Activities */}
       <div className="p-8">
           <div className="flex justify-between items-end mb-6">
               <h2 className="text-2xl font-bold text-white">AI活动</h2>
               <Icons.ChevronRight className="text-gray-500 cursor-pointer hover:text-white"/>
           </div>
           <div className="grid grid-cols-3 gap-6">
               {ACTIVITIES.map(act => (
                   <div key={act.id} onClick={() => setSelectedActivity(act)} className="bg-spark-card border border-spark-border rounded-xl overflow-hidden group cursor-pointer hover:border-spark-accent transition-all relative">
                       <div className="aspect-[16/9] relative">
                           <img src={act.img} className="w-full h-full object-cover"/>
                           <div className="absolute top-2 left-2 flex gap-2">
                               <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded shadow-lg shadow-yellow-500/20">现金奖</span>
                           </div>
                           <div className={`absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${act.status==='进行中'?'bg-orange-500 text-white':'bg-gray-600 text-gray-300'}`}>
                               <Icons.Flame size={12} className={act.status==='进行中'?'fill-white':''}/> {act.status}
                           </div>
                       </div>
                       <div className="p-4 bg-gradient-to-b from-gray-900 to-black">
                           <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{act.title}</h3>
                           <div className="flex gap-2">
                               {act.tags.map(t => <span key={t} className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{t}</span>)}
                           </div>
                       </div>
                   </div>
               ))}
           </div>
       </div>

       {/* 3. Courses */}
       <div className="p-8 pt-0">
           <div className="flex justify-between items-end mb-6">
               <h2 className="text-2xl font-bold text-white">热门AI课程</h2>
               <Icons.ChevronRight className="text-gray-500 cursor-pointer hover:text-white"/>
           </div>
           
           <div className="grid grid-cols-4 gap-6">
               {/* Featured */}
               <div onClick={() => setSelectedCourse(FEATURED_COURSE)} className="col-span-1 bg-gradient-to-b from-gray-800 to-black border border-gray-700 rounded-xl overflow-hidden relative group cursor-pointer flex flex-col">
                   <div className="absolute top-0 left-0 w-full h-full">
                       <img src={FEATURED_COURSE.img} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"/>
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                   </div>
                   <div className="relative z-10 p-6 flex flex-col h-full">
                       <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded w-fit mb-4 shadow-lg">重磅上新</div>
                       <div className="text-gray-300 text-xs mb-1">AI TOP100 | 极客时间</div>
                       <h3 className="text-2xl font-bold text-white mb-2 leading-tight">199 学 10 门 <br/> AI 应用课</h3>
                       <p className="text-sm text-gray-400 mb-auto">200+ 实操视频 案例讲解</p>
                       
                       <div className="mt-4">
                           <div className="flex items-end gap-2 mb-4">
                               <span className="text-3xl font-bold text-orange-500">¥199</span>
                               <span className="text-sm text-gray-500 line-through mb-1">¥334</span>
                           </div>
                           <button className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-colors">查看详情</button>
                       </div>
                   </div>
               </div>

               {/* Grid */}
               <div className="col-span-2 grid grid-cols-2 gap-4">
                   {SUB_COURSES.map((c, i) => (
                       <div key={i} onClick={() => setSelectedCourse(c)} className="bg-spark-card border border-spark-border rounded-xl p-3 flex gap-4 hover:border-spark-accent cursor-pointer group transition-all hover:bg-spark-surface">
                           <div className="w-24 aspect-[3/4] rounded-lg overflow-hidden shrink-0 relative border border-gray-800 shadow-lg">
                               <img src={c.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                               {c.price === 0 && <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-br">免费</div>}
                           </div>
                           <div className="flex flex-col justify-between flex-1 py-1">
                               <div>
                                   <div className="flex gap-2 mb-1.5">
                                       {i===0 && <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] px-1.5 rounded">重磅上新</span>}
                                       {i>2 && <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] px-1.5 rounded">高手带路</span>}
                                   </div>
                                   <h4 className="text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-spark-accent mb-1">{c.title}</h4>
                                   <p className="text-gray-500 text-xs flex items-center gap-1"><Icons.User size={10}/> {c.instructor} <span className="mx-1">·</span> {c.lessons > 0 ? `${c.lessons} 节课` : '直播'}</p>
                               </div>
                               <div className="flex items-center justify-between mt-2">
                                   <div className="flex items-baseline gap-2">
                                       <span className={`text-base font-bold ${c.price===0?'text-yellow-500':'text-orange-500'}`}>{c.price===0 ? '免费' : `¥${c.price}`}</span>
                                       <span className="text-xs text-gray-600 line-through">¥{c.oldPrice}</span>
                                   </div>
                                   <button className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded">购买</button>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>

               {/* Menu */}
               <div className="col-span-1 space-y-4">
                   {COURSE_CATEGORIES.map((cat, i) => (
                       <div key={cat.id} className={`h-[23%] rounded-xl flex items-center justify-between px-6 cursor-pointer border transition-all relative overflow-hidden group ${cat.active ? 'bg-gradient-to-r from-red-900/40 to-black border-red-900' : 'bg-gray-900 border-gray-800 hover:border-gray-600'}`}>
                           <div className="flex items-center gap-3 z-10">
                               <h3 className={`text-lg font-bold ${cat.active ? 'text-red-400' : 'text-gray-300 group-hover:text-white'}`}>{cat.label}</h3>
                           </div>
                           <cat.icon size={32} className={`z-10 ${cat.active ? 'text-red-500' : 'text-gray-700 group-hover:text-gray-500'}`}/>
                           <Icons.BookOpen className="absolute -bottom-4 -right-4 text-white/5 w-24 h-24 rotate-12 group-hover:scale-110 transition-transform"/>
                       </div>
                   ))}
               </div>
           </div>

           {/* Big Shot Banner */}
           <div className="mt-8 relative rounded-2xl overflow-hidden h-64 group cursor-pointer border border-gray-800 hover:border-spark-accent">
               <img src="https://image.pollinations.ai/prompt/ai%20conference%20stage%20spotlight%20speaker%20dark%20tech%20background?width=1200&height=400&nologo=true" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"/>
               <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent flex items-center">
                   <div className="pl-12 w-1/2">
                       <div className="flex items-center gap-2 mb-2">
                           <span className="text-gray-400 border border-gray-600 px-2 py-0.5 rounded text-xs tracking-widest">AI TOP100</span>
                           <h3 className="text-3xl font-bold text-white italic">AI 大咖说</h3>
                       </div>
                       <p className="text-gray-400 text-sm mb-6">全国首创的一档AI行业专家访谈类直播节目</p>
                       <button className="bg-orange-500 text-white font-bold px-6 py-2 rounded hover:bg-orange-600 transition-colors">点击进入</button>
                   </div>
                   <div className="bg-blue-600/90 p-6 w-[400px] h-full flex flex-col justify-center skew-x-[-10deg] translate-x-12 hover:skew-x-0 transition-transform duration-500 relative overflow-hidden">
                        <img src="https://image.pollinations.ai/prompt/professional%20portrait%20asian%20female%20expert%20speaker%20short%20hair%20glasses%20smart%20casual%20blue%20background?width=300&height=400&nologo=true" className="absolute right-0 bottom-0 h-full w-auto object-contain opacity-90 mix-blend-luminosity skew-x-[10deg] translate-x-8"/>
                        <div className="skew-x-[10deg] hover:skew-x-0 transition-transform duration-500 relative z-10">
                            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1">第十二期 AMA专访</span>
                            <h2 className="text-3xl font-bold text-white mt-4 mb-2">AI 复制时代的 <br/> 科幻创作</h2>
                            <div className="text-yellow-400 font-mono font-bold text-xl">TIME: 2023.12.26 20:00</div>
                        </div>
                   </div>
                   <div className="absolute right-0 h-full w-1/3 bg-black/80 p-4 overflow-y-auto">
                        <h4 className="text-orange-500 text-xs font-bold mb-4">• AI复制时代的科幻创作 <span className="float-right border border-orange-500 px-1 rounded">看回放</span></h4>
                        <div className="space-y-4">
                            {['AI在手，艺术我有', 'AI将如何改变叙事', '如何利用AIGC提效', 'PromeAI赋能设计'].map((t, i) => (
                                <div key={i} className="flex justify-between items-center group/item cursor-pointer">
                                    <span className="text-gray-400 text-xs truncate w-48 group-hover/item:text-white">• {t}</span>
                                    <span className="text-[10px] text-gray-600 border border-gray-800 px-1 rounded group-hover/item:border-gray-500">看回放</span>
                                </div>
                            ))}
                        </div>
                   </div>
               </div>
           </div>
       </div>

       {/* 4. Creators (Renamed to Excellent Creators) */}
       <div className="p-8">
           <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-white">优秀创作者</h2>
               <button className="text-gray-500 text-sm hover:text-white">换一批</button>
           </div>
           <div className="grid grid-cols-4 gap-4">
               {CREATORS.map((c, i) => (
                   <div key={i} className="bg-spark-card border border-spark-border rounded-xl p-4 hover:border-spark-accent transition-all cursor-pointer group">
                       <div className="flex items-center gap-4 mb-4">
                           <img src={c.avatar} className="w-12 h-12 rounded-full border border-gray-700 group-hover:border-spark-accent transition-colors"/>
                           <div className="flex-1">
                               <div className="flex items-center gap-2 flex-wrap">
                                   <h4 className="text-white font-bold">{c.name}</h4>
                                   <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${c.level === UserLevel.CORE ? 'border-red-600 text-red-400 bg-red-900/30' : c.level === UserLevel.ELITE ? 'border-yellow-600 text-yellow-400 bg-yellow-900/30' : 'border-blue-600 text-blue-400 bg-blue-900/30'}`}>{c.level}</span>
                               </div>
                               <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{c.role}</p>
                           </div>
                       </div>
                       
                       <div className="bg-gray-900/50 rounded-lg p-3 grid grid-cols-3 gap-2 border border-gray-800">
                           <div className="text-center">
                               <div className="text-[10px] text-gray-500 mb-1">作品</div>
                               <div className="text-white font-bold text-sm">{c.works}</div>
                           </div>
                           <div className="text-center border-l border-gray-700">
                               <div className="text-[10px] text-gray-500 mb-1">接单</div>
                               <div className="text-white font-bold text-sm">{c.orders}</div>
                           </div>
                           <div className="text-center border-l border-gray-700">
                               <div className="text-[10px] text-gray-500 mb-1">收入</div>
                               <div className="text-spark-accent font-bold text-sm">{(c.revenue/1000).toFixed(1)}k</div>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
};

// ... (CreatorDataCenterView, MembershipView, Sidebar, Header, StudioView, LoginView, App main component unchanged) ...
// ... (Including CreatorDataCenterView etc for completeness) ...
const CreatorDataCenterView = ({ stats }: { stats: CreatorStats }) => {
    // ... (Existing CreatorDataCenterView)
    return (
        <div className="h-full overflow-y-auto p-8 bg-black">
            <div className="w-full">
                 <div className="flex items-center gap-6 mb-10">
                     <img src={MOCK_USER.avatar} className="w-24 h-24 rounded-full border-4 border-spark-surface"/>
                     <div>
                         <h1 className="text-3xl font-bold text-white mb-2">{MOCK_USER.name}</h1>
                         <div className="flex gap-4">
                             <span className="bg-spark-accent text-black px-3 py-0.5 rounded text-sm font-bold">UID: {MOCK_USER.uid}</span>
                             <span className="bg-gray-800 text-white px-3 py-0.5 rounded text-sm border border-gray-600">{MOCK_USER.level} Member</span>
                         </div>
                     </div>
                 </div>
                 <div className="grid grid-cols-4 gap-6 mb-8">
                     {[{l:'累计收益',v:stats.earnings,u:'元',i:Icons.Yen}, {l:'总播放量',v:stats.totalViews,u:'',i:Icons.Video}, {l:'作品数',v:stats.projectsCreated,u:'个',i:Icons.Layers}, {l:'综合ROI',v:stats.roi,u:'%',i:Icons.Activity}].map((s,i) => (
                         <div key={i} className="bg-spark-card border border-spark-border p-6 rounded-xl flex items-center justify-between">
                             <div><div className="text-gray-400 text-sm mb-1">{s.l}</div><div className="text-3xl font-bold text-white">{s.v.toLocaleString()}<span className="text-sm text-gray-500 ml-1">{s.u}</span></div></div>
                             <div className="w-12 h-12 bg-spark-surface rounded-full flex items-center justify-center text-gray-500"><s.i/></div>
                         </div>
                     ))}
                 </div>
                 <div className="grid grid-cols-3 gap-8">
                     <div className="col-span-2 bg-spark-card border border-spark-border rounded-xl p-6">
                         <h3 className="font-bold text-white mb-6">收益趋势</h3>
                         <div className="h-64">
                             <ResponsiveContainer width="100%" height="100%"><LineChart data={[{name:'Mon',v:200},{name:'Tue',v:450},{name:'Wed',v:300},{name:'Thu',v:800},{name:'Fri',v:500},{name:'Sat',v:900},{name:'Sun',v:700}]}><CartesianGrid strokeDasharray="3 3" stroke="#333"/><XAxis dataKey="name" stroke="#666"/><YAxis stroke="#666"/><Tooltip contentStyle={{backgroundColor:'#18181b',border:'1px solid #333'}}/><Line type="monotone" dataKey="v" stroke="#fbbf24" strokeWidth={3} dot={{r:4}}/></LineChart></ResponsiveContainer>
                         </div>
                     </div>
                     <div className="bg-spark-card border border-spark-border rounded-xl p-6">
                         <h3 className="font-bold text-white mb-4">近期任务交付</h3>
                         <div className="space-y-4">
                             {stats.taskHistory.map((t,i) => (
                                 <div key={i} className="flex justify-between items-center border-b border-spark-border pb-3 last:border-0">
                                     <div><div className="text-white text-sm font-bold">{t.taskTitle}</div><div className="text-xs text-gray-500">{t.completionDate}</div></div>
                                     <div className={`text-xs px-2 py-1 rounded ${t.delivered ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>{t.delivered?'已交付':'未交付'}</div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    );
}

const MembershipView = ({ onBack, onPurchase }: { onBack: () => void, onPurchase: (amount: number) => void }) => {
    // ... (Existing MembershipView)
    const PLANS = [
        { name: '基础会员', price: 999, credits: 1500, features: { rechargeBonus: '无额外奖励', tasks: '基础任务 (¥5000以下)', adDiscount: '无折扣', incubator: '线上基础课程、会员交流群', ecosystem: '参与生态相关活动' } },
        { name: '精英会员', price: 4999, credits: 7500, features: { rechargeBonus: '永久 25% 额外奖励', tasks: '精英任务 (¥5000-10万)', adDiscount: '投流 9 折', incubator: '孵化营课程、线下3日实战指导、导师服务', ecosystem: '实战结业证书、版权评估融资资格' } },
        { name: '核心会员', price: 29999, credits: 45000, features: { rechargeBonus: '永久 50% 额外奖励', tasks: '全量任务 (含¥10万+政企订单)', adDiscount: '投流 8 折', incubator: '全量课程、线下7日游学、1v1大咖导师', ecosystem: '游学证书、媒体曝光、产业投资孵化指导' } }
    ];

    return (
        <div className="h-full overflow-y-auto p-8 bg-black w-full">
            <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white"><Icons.ChevronLeft/> 返回</button>
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">升级会员权益</h2>
                <p className="text-gray-400">解锁更多 AI 算力与独家生态资源，一次开通，终生有效</p>
            </div>
            <div className="grid grid-cols-3 gap-8 max-w-7xl mx-auto">
                {PLANS.map((plan, i) => (
                    <div key={i} className={`bg-spark-card border ${i===2?'border-spark-accent shadow-[0_0_30px_rgba(251,191,36,0.15)]':'border-spark-border'} rounded-2xl p-8 flex flex-col relative transition-transform hover:-translate-y-2`}>
                        {i===2 && <div className="absolute top-0 right-0 bg-spark-accent text-black text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl">MOST POPULAR</div>}
                        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                        <div className="text-4xl font-bold text-spark-accent mb-6">¥ {plan.price.toLocaleString()}</div>
                        <div className="flex-1 space-y-6 mb-10">
                            <div className="bg-spark-surface p-4 rounded-xl border border-spark-border"><div className="flex items-center gap-2 text-white font-bold mb-1"><Icons.CreditCard size={16} className="text-spark-accent"/> 积分权益</div><div className="text-sm text-gray-400">赠送 {plan.credits} 积分</div><div className="text-xs text-spark-accent mt-1">续充：{plan.features.rechargeBonus}</div></div>
                            <ul className="space-y-3 text-sm">
                                <li className="flex gap-3"><Icons.Briefcase size={16} className="text-gray-500 flex-shrink-0 mt-0.5"/><div><div className="text-white font-bold">任务墙权限</div><div className="text-gray-400 text-xs">{plan.features.tasks}</div></div></li>
                                <li className="flex gap-3"><Icons.Share size={16} className="text-gray-500 flex-shrink-0 mt-0.5"/><div><div className="text-white font-bold">投流折扣</div><div className="text-gray-400 text-xs">{plan.features.adDiscount}</div></div></li>
                                <li className="flex gap-3"><Icons.Flame size={16} className="text-gray-500 flex-shrink-0 mt-0.5"/><div><div className="text-white font-bold">孵化营权益</div><div className="text-gray-400 text-xs">{plan.features.incubator}</div></div></li>
                                <li className="flex gap-3"><Icons.Global size={16} className="text-gray-500 flex-shrink-0 mt-0.5"/><div><div className="text-white font-bold">生态权益</div><div className="text-gray-400 text-xs">{plan.features.ecosystem}</div></div></li>
                            </ul>
                        </div>
                        <button onClick={() => onPurchase(plan.price)} className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide ${i===2 ? 'bg-spark-accent text-black shadow-lg shadow-spark-accent/30' : 'bg-white/10 text-white hover:bg-white hover:text-black'}`}>立即开通</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Sidebar = ({ activeTab, setActiveTab }: any) => (
    // ... (Existing Sidebar)
     <aside className="w-64 h-screen bg-spark-card border-r border-spark-border flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-spark-border flex items-center gap-2"><Icons.Spark className="text-spark-accent w-8 h-8" /><span className="text-2xl font-bold text-white tracking-tight">Sparkreel</span></div>
      <div className="p-4 space-y-2 mt-4">
          {[{id:'home',i:Icons.Dashboard,l:'首页'}, {id:'tasks',i:Icons.Briefcase,l:'赏金任务'}, {id:'studio',i:Icons.Film,l:'漫剧制作'}, {id:'traffic',i:Icons.Global,l:'发行投流'}, {id:'incubator',i:Icons.Flame,l:'孵化营'}].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium ${activeTab === item.id ? 'bg-spark-accent text-black shadow-lg shadow-spark-accent/20' : 'text-gray-400 hover:text-white hover:bg-spark-surface'}`}><item.i size={20}/>{item.l}</button>
          ))}
      </div>
    </aside>
);

const Header = ({ user, onNavigate, onRecharge }: any) => {
    // ... (Existing Header)
    const [menuOpen, setMenuOpen] = useState(false);
    
    const getBadgeStyle = (level: UserLevel) => {
        switch(level) {
            case UserLevel.CORE: return 'bg-red-900/50 text-red-200 border-red-700';
            case UserLevel.ELITE: return 'bg-yellow-900/50 text-yellow-200 border-yellow-700';
            default: return 'bg-blue-900/50 text-blue-200 border-blue-700';
        }
    };

    return (
        <header className="h-16 bg-black/80 backdrop-blur sticky top-0 z-40 flex items-center justify-between px-8 border-b border-spark-border ml-64">
            <div className="flex items-center gap-4 text-gray-400 text-sm"><Icons.Search size={16}/> 按回车搜索全站...</div>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-spark-accent font-bold"><Icons.CreditCard size={16}/> {user.credits.toLocaleString()} 积分</div>
                <button onClick={onRecharge} className="text-spark-accent border border-spark-accent rounded-full px-4 py-1.5 text-sm font-bold hover:bg-spark-accent hover:text-black transition-colors flex items-center gap-2"><Icons.Plus size={14}/> 充值</button>
                <div className="relative">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
                        <div className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getBadgeStyle(user.level)}`}>{user.level}</div>
                        <img src={user.avatar} className="w-9 h-9 rounded-full border border-spark-border hover:border-spark-accent transition-colors"/>
                    </div>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-spark-card border border-spark-border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                             <div className="px-4 py-3 border-b border-spark-border mb-2"><div className="text-white font-bold">{user.name}</div><div className="text-xs text-gray-500">ID: {user.uid}</div></div>
                             {[{l:'创作者中心',a:'creator-data',i:Icons.User}, {l:'会员订阅',a:'membership',i:Icons.Crown}, {l:'系统设置',a:'settings',i:Icons.Settings}, {l:'退出登录',a:'logout',i:Icons.LogOut}].map((m,i) => (
                                 <button key={i} onClick={() => { onNavigate(m.a); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-spark-surface hover:text-white flex items-center gap-3 text-sm"><m.i size={16}/>{m.l}</button>
                             ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

const StudioView = ({ onSelectProject }: { onSelectProject: (p: Project) => void }) => {
    // ... (Existing StudioView)
    const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', description: '', cover: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCreateProject = () => {
        const p: Project = {
            id: `p_${Date.now()}`,
            title: newProject.title || '未命名项目',
            description: newProject.description || '暂无描述',
            cover: newProject.cover || 'https://picsum.photos/300/200',
            lastModified: '刚刚',
            status: 'Draft',
            progress: 0,
            snippets: [], characters: [], props: [], scenes: []
        };
        const updatedList = [p, ...projects];
        setProjects(updatedList);
        MOCK_PROJECTS.unshift(p);
        
        setShowCreateModal(false);
        setNewProject({ title: '', description: '', cover: '' });
        onSelectProject(p);
    };

    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setNewProject({ ...newProject, cover: url });
        }
    };

    return (
        <div className="h-full overflow-y-auto p-8 bg-black w-full">
            <div className="w-full">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Icons.Studio className="text-spark-accent"/> 漫剧制作台</h2>
                </div>
                <div className="grid grid-cols-5 gap-6">
                    <button onClick={() => setShowCreateModal(true)} className="h-full min-h-[300px] border-2 border-dashed border-spark-border rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-spark-accent transition-all">
                        <Icons.Plus size={48} className="mb-4 opacity-50"/>
                        <span className="font-bold">创建一个新项目</span>
                    </button>
                    {projects.map(project => (
                        <div key={project.id} onClick={() => onSelectProject(project)} className="bg-spark-card border border-spark-border rounded-xl overflow-hidden cursor-pointer hover:border-spark-accent transition-all group">
                            <div className="h-48 bg-gray-800 relative overflow-hidden">
                                <img src={project.cover} className="w-full h-full object-cover transition-transform group-hover:scale-105"/>
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-white border border-white/10">{project.status}</div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-white text-lg mb-1 truncate">{project.title}</h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{project.description}</p>
                                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-spark-accent h-full" style={{width: `${project.progress}%`}}></div>
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-gray-500"><span>进度 {project.progress}%</span><span>{project.lastModified}</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showCreateModal && (
                <Modal title="创建新项目" onClose={() => setShowCreateModal(false)} size="md">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">项目名称</label>
                            <input 
                                className="w-full bg-black border border-spark-border rounded p-3 text-white focus:border-spark-accent outline-none" 
                                value={newProject.title} 
                                onChange={e => setNewProject({...newProject, title: e.target.value})}
                                placeholder="请输入项目名称"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">项目描述</label>
                            <textarea 
                                className="w-full h-24 bg-black border border-spark-border rounded p-3 text-white resize-none focus:border-spark-accent outline-none" 
                                value={newProject.description} 
                                onChange={e => setNewProject({...newProject, description: e.target.value})}
                                placeholder="简单描述你的故事创意..."
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">项目封面</label>
                            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-spark-border rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-spark-accent text-gray-500 relative overflow-hidden group">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload}/>
                                {newProject.cover ? (
                                    <>
                                        <img src={newProject.cover} className="w-full h-full object-cover"/>
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs">更换图片</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Icons.ImagePlus size={24} className="mb-2"/>
                                        <span className="text-xs">点击上传封面图</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="pt-4">
                            <button onClick={handleCreateProject} disabled={!newProject.title} className="w-full bg-spark-accent text-black font-bold py-3 rounded-lg hover:bg-spark-accentHover disabled:opacity-50 disabled:cursor-not-allowed">
                                立即创建
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const LoginView = ({ onLogin }: any) => (
   // ... (Existing LoginView)
   <div className="h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover opacity-30"></div>
        <div className="bg-black/80 backdrop-blur-xl border border-spark-border p-10 rounded-2xl w-full max-w-md shadow-2xl z-10">
             <div className="text-center mb-8">
                 <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3"><Icons.Spark className="text-spark-accent fill-spark-accent" size={32}/> Sparkreel</h1>
                 <p className="text-gray-500 text-sm">AI 漫剧创作与发行平台</p>
             </div>
             <div className="flex bg-spark-surface p-1 rounded-lg mb-8 border border-spark-border">
                 <button className="flex-1 py-2.5 rounded font-medium bg-spark-card text-white shadow">手机号登录</button>
                 <button className="flex-1 py-2.5 rounded font-medium text-gray-500 hover:text-white">微信扫码</button>
             </div>
             <div className="space-y-4 mb-8">
                 <input className="w-full bg-black border border-spark-border rounded-lg p-4 text-white outline-none focus:border-spark-accent" placeholder="请输入手机号"/>
                 <input className="w-full bg-black border border-spark-border rounded-lg p-4 text-white outline-none focus:border-spark-accent" type="password" placeholder="请输入密码"/>
             </div>
             <button onClick={onLogin} className="w-full py-4 bg-spark-accent text-black font-bold rounded-lg hover:bg-spark-accentHover shadow-lg shadow-spark-accent/20 text-lg">立即登录</button>
             <div className="mt-6 text-center text-sm text-gray-500">注册即代表同意 <a href="#" className="text-spark-accent hover:underline">用户协议</a></div>
        </div>
    </div>
);

const App = () => {
  // ... (Existing App implementation)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [isScriptWizardOpen, setIsScriptWizardOpen] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [paymentType, setPaymentType] = useState<'recharge' | 'membership'>('recharge');
  const [playVideoUrl, setPlayVideoUrl] = useState<string | null>(null);

  if (!isLoggedIn) return <LoginView onLogin={() => setIsLoggedIn(true)} />;

  const handleWizardFinish = (finalVideos: FinalVideo[]) => {
      if (selectedProject) {
          const newSnippets: Snippet[] = finalVideos.map((v, i) => ({
              id: `snip_${Date.now()}_${i}`,
              projectId: selectedProject.id,
              name: `生成片段 ${selectedProject.snippets.length + i + 1}`,
              description: v.prompt,
              status: 'Completed',
              mode: CreationMode.SCRIPT_TO_VIDEO,
              createdAt: new Date().toLocaleDateString(),
              thumbnail: 'https://picsum.photos/300/200'
          }));
          const updatedProject = {
              ...selectedProject,
              snippets: [...selectedProject.snippets, ...newSnippets],
              lastModified: '刚刚',
              progress: Math.min(100, selectedProject.progress + 10)
          };
          setSelectedProject(updatedProject);
          const index = MOCK_PROJECTS.findIndex(p => p.id === updatedProject.id);
          if (index !== -1) {
              MOCK_PROJECTS[index] = updatedProject;
          }
      }
      setIsScriptWizardOpen(false);
  };

  const renderContent = () => {
      if (activeTab === 'membership') return <MembershipView onBack={() => setActiveTab('home')} onPurchase={(amount) => { setPaymentAmount(amount); setPaymentType('membership'); }} />;
      if (activeTab === 'creator-data') return <CreatorDataCenterView stats={MOCK_STATS} />;
      if (activeTab === 'studio') {
          if (isScriptWizardOpen && selectedProject) return <ScriptToVideoWizard project={selectedProject} onCancel={() => setIsScriptWizardOpen(false)} onFinish={handleWizardFinish} />;
          if (selectedSnippet && selectedProject) return <SnippetEditor snippet={selectedSnippet} project={selectedProject} onBack={() => setSelectedSnippet(null)} />;
          if (selectedProject) return <ProjectDetailView project={selectedProject} onBack={() => setSelectedProject(null)} onEditSnippet={setSelectedSnippet} onCreateScriptVideo={() => setIsScriptWizardOpen(true)} />;
          return <StudioView onSelectProject={setSelectedProject} />;
      }
      switch(activeTab) {
          case 'home': return <HomeView onPlayVideo={(url) => setPlayVideoUrl(url)} />;
          case 'tasks': return <TaskWallView />;
          case 'traffic': return <TrafficView />;
          case 'incubator': return <IncubatorView />;
          default: return <HomeView onPlayVideo={(url) => setPlayVideoUrl(url)} />;
      }
  };

  return (
    <div className="min-h-screen bg-black text-spark-text font-sans selection:bg-spark-accent selection:text-black">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Header 
          user={MOCK_USER} 
          onNavigate={(path: string) => { if(path==='logout') setIsLoggedIn(false); else setActiveTab(path); }} 
          onRecharge={() => setShowRecharge(true)}
      />
      <main className="ml-64 h-[calc(100vh-64px)] overflow-hidden">
          {renderContent()}
      </main>
      {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} userLevel={MOCK_USER.level} />}
      {playVideoUrl && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-12">
              <button onClick={() => setPlayVideoUrl(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white"><Icons.Close size={32}/></button>
              <div className="relative w-full h-full flex items-center justify-center">
                  <video src={playVideoUrl} controls autoPlay className="max-w-full max-h-full rounded-lg shadow-2xl"/>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;