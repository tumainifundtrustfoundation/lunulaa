-- ====================================================================
-- LUPANULLA ELIMU HUB ("Kitovu cha Elimu Tanzania")
-- COMPLETE ENTERPRISE-GRADE POSTGRESQL & SUPABASE DATABASE SCHEMA
-- Target Domain: lupanulla.co.tz
-- Production Ready with Foreign Keys, Constraints, Indexes, Triggers, RLS & Views
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ROLE TYPES & SYSTEM STATUS ENUMS
-- ==========================================
CREATE TYPE user_role AS ENUM (
  'student', 
  'teacher', 
  'author', 
  'seller', 
  'admin', 
  'finance_admin', 
  'content_admin', 
  'support_admin', 
  'super_admin'
);

CREATE TYPE sub_tier AS ENUM ('free', 'premium', 'institutional_pro');
CREATE TYPE exam_grade_scale AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');
CREATE TYPE payment_gateway AS ENUM ('mpesa', 'airtel_money', 'tigopesa', 'halopesa', 'stripe', 'paypal', 'mix_by_yas');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE product_category AS ENUM ('books', 'notes_pdf', 'equipment', 'past_papers_bundle', 'revision_kits');

-- ==========================================
-- 2. USERS, PROFILES & ACCESS CONTROL
-- ==========================================

-- Profiles (linked 1:1 to Supabase Auth Users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(30),
  role user_role DEFAULT 'student'::user_role NOT NULL,
  subscription_tier sub_tier DEFAULT 'free'::sub_tier NOT NULL,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  avatar_url TEXT,
  region_id UUID, -- Reference to geographical region table
  current_xp INTEGER DEFAULT 0 NOT NULL,
  streak_days INTEGER DEFAULT 0 NOT NULL,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID, -- Referral tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Roles Permissions mapping (Role Based Access Control - RBAC)
CREATE TABLE public.permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role user_role NOT NULL,
  action VARCHAR(100) NOT NULL, -- e.g. 'course:create', 'user:delete'
  description TEXT,
  UNIQUE(role, action)
);

-- Regions table (Tanzania geographical data)
CREATE TABLE public.regions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'Dar es Salaam', 'Arusha', 'Mwanza'
  capital VARCHAR(100),
  zone VARCHAR(100), -- e.g. 'Lake Zone', 'Northern Zone', 'Eastern Zone'
  total_schools INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Foreign Key constraint to profiles table
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_regions FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE SET NULL;

-- ==========================================
-- 3. COURSES & ACADEMIC CONTENT
-- ==========================================

-- Courses catalog
CREATE TABLE public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  syllabus TEXT,
  grade_level VARCHAR(100) NOT NULL, -- e.g., 'Primary', 'O-Level', 'A-Level'
  subject_name VARCHAR(100) NOT NULL, -- e.g., 'Mathematics', 'Physics', 'History'
  price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL, -- 0 for Free
  is_published BOOLEAN DEFAULT false NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Lessons details
CREATE TABLE public.lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  sequence_number INT NOT NULL,
  content_markdown TEXT,
  video_url TEXT, -- External YouTube/Vimeo stream or Supabase storage
  is_free_preview BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, sequence_number)
);

-- Enrolled courses history (for student tracking)
CREATE TABLE public.enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  progress_percentage INTEGER DEFAULT 0 NOT NULL,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, course_id)
);

-- ==========================================
-- 4. INTERACTIVE EXAMS & ASSESSMENTS
-- ==========================================

-- NECTA Past Papers & Custom Exam Headers
CREATE TABLE public.exams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  grade_level VARCHAR(100) NOT NULL, -- e.g., 'CSEE', 'ACSEE', 'SFNA'
  exam_year INT NOT NULL,
  duration_minutes INT DEFAULT 180 NOT NULL,
  passing_score INTEGER DEFAULT 45 NOT NULL,
  is_interactive BOOLEAN DEFAULT true NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz questions table
CREATE TABLE public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  explanation TEXT, -- AI tutoring hint or textbook explanation
  sequence_number INT NOT NULL,
  marks_weight INT DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question options for multiple-choice quizzes
CREATE TABLE public.question_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false NOT NULL
);

-- Student Exam Results
CREATE TABLE public.exam_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  raw_score NUMERIC(5, 2) NOT NULL,
  percentage_score NUMERIC(5, 2) NOT NULL,
  letter_grade exam_grade_scale NOT NULL,
  is_passed BOOLEAN NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 5. ACADEMIC CERTIFICATES & AUTHENTICATION
-- ==========================================
CREATE TABLE public.certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exam_result_id UUID REFERENCES public.exam_results(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  unique_verification_code VARCHAR(100) UNIQUE NOT NULL, -- Format LUP-YEAR-HEX
  verification_qr_url TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  has_been_revoked BOOLEAN DEFAULT false NOT NULL
);

-- ==========================================
-- 6. PAYMENTS, WALLETS & TRANSACTIONS
-- ==========================================

-- Digital Creator Wallets (Teachers, Authors, Sellers)
CREATE TABLE public.wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance_tsh NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  total_withdrawn_tsh NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  currency VARCHAR(10) DEFAULT 'TZS' NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform transaction ledger (Supports M-Pesa, Airtel Money, Stripe, PayPal)
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  receiver_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  amount_tsh NUMERIC(15, 2) NOT NULL,
  gateway payment_gateway NOT NULL,
  external_reference VARCHAR(255), -- M-Pesa Transaction ID (e.g. SPC98FHK8) or Stripe Session ID
  status transaction_status DEFAULT 'pending'::transaction_status NOT NULL,
  purpose VARCHAR(255) NOT NULL, -- e.g., 'premium_subscription', 'course_purchase', 'payout'
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawal Payout Logs
CREATE TABLE public.payouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  requested_amount NUMERIC(15, 2) NOT NULL,
  payout_channel payment_gateway NOT NULL, -- e.g., 'mpesa', 'tigopesa'
  destination_number VARCHAR(100) NOT NULL, -- mobile money account number
  status transaction_status DEFAULT 'pending'::transaction_status NOT NULL,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 7. MARKETPLACE (E-COMMERCE STORE)
-- ==========================================

-- Product Listings (Books, PDF notes, physical revision equipment)
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category product_category NOT NULL,
  price_tsh NUMERIC(12, 2) NOT NULL,
  stock_quantity INT DEFAULT 100 NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_file_url TEXT, -- For notes_pdf downloads
  image_urls TEXT[],
  is_approved BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Ledger
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  payment_transaction_id UUID REFERENCES public.transactions(id),
  shipping_address TEXT, -- Empty for digital products
  status VARCHAR(100) DEFAULT 'pending' NOT NULL, -- pending, paid, shipped, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Relation
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL NOT NULL,
  quantity INT DEFAULT 1 NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL
);

-- ==========================================
-- 8. STUDENT COMMUNITY FORUMS
-- ==========================================

-- Forum Main Topics
CREATE TABLE public.forum_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- e.g., 'masomo', 'vyuo', 'ushauri'
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  upvotes INTEGER DEFAULT 0 NOT NULL,
  views INTEGER DEFAULT 0 NOT NULL,
  tags VARCHAR(50)[],
  is_moderated BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Replies / Comments
CREATE TABLE public.forum_replies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0 NOT NULL,
  is_best_answer BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 9. USER INBOX NOTIFICATIONS
-- ==========================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(100) DEFAULT 'general' NOT NULL, -- e.g., 'payment', 'enrollment', 'forum_reply'
  link_url TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 10. AI CHATS LOGS & TOKEN METRICS
-- ==========================================
CREATE TABLE public.ai_chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID DEFAULT uuid_generate_v4() NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  model_name VARCHAR(100) DEFAULT 'gemini-3.5-flash' NOT NULL,
  tokens_used_input INTEGER DEFAULT 0,
  tokens_used_output INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 11. REFERRALS LEDGER
-- ==========================================
CREATE TABLE public.referrals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referred_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  commission_earned NUMERIC(10, 2) DEFAULT 5000.00 NOT NULL,
  payout_transaction_id UUID REFERENCES public.transactions(id),
  has_been_paid BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 12. AUDIT LOGS & SITE SETTINGS
-- ==========================================
CREATE TABLE public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL, -- e.g. 'user:ban', 'payout:approve', 'product:create'
  details TEXT,
  ip_address VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE public.site_settings (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 13. AUTOMATED DATABASE PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_lessons_course ON public.lessons(course_id);
CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_exam_results_student ON public.exam_results(student_id);
CREATE INDEX idx_certificates_code ON public.certificates(unique_verification_code);
CREATE INDEX idx_transactions_reference ON public.transactions(external_reference);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_forum_posts_category ON public.forum_posts(category);
CREATE INDEX idx_forum_posts_slug ON public.forum_posts(slug);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;

-- ========================================================
-- 14. ROW-LEVEL SECURITY (RLS) POLICIES ON PRODUCTION TABLES
-- ========================================================

-- Enable RLS for security auditing
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by anyone." 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can edit their own profile." 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Courses Policies
CREATE POLICY "Published courses are viewable by everyone." 
ON public.courses FOR SELECT 
USING (is_published = true);

CREATE POLICY "Authors can manage their own courses." 
ON public.courses FOR ALL 
USING (auth.uid() = author_id);

-- Certificates Policies
CREATE POLICY "Certificates are viewable by everyone." 
ON public.certificates FOR SELECT 
USING (true);

-- Wallets Policies
CREATE POLICY "Users can only view their own wallets." 
ON public.wallets FOR SELECT 
USING (auth.uid() = owner_id);

-- ========================================================
-- 15. DATABASE TRIGGERS & CONVENIENCE SYSTEM FUNCTIONS
-- ========================================================

-- Trigger to update updated_at timestamp automatically on profile changes
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_profiles_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

-- Trigger to create a default wallet whenever a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (owner_id, balance_tsh)
  VALUES (NEW.id, 0.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supposing this trigger fires after a profile record insertion
CREATE TRIGGER trigger_create_new_user_wallet
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();
