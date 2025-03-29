import Layout from '../../components/layout';

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">About HeadcraftAI</h1>
        
        <div className="prose lg:prose-xl max-w-4xl mx-auto">
          <p className="text-lg text-gray-600 mb-6">
            HeadcraftAI is an innovative platform that leverages advanced artificial intelligence to transform your regular photos into professional-quality headshots.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600 mb-6">
            Our mission is to make professional headshots accessible to everyone. We believe that having a high-quality professional image shouldn&apos;t be limited by location, budget, or access to professional photographers.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">How Our Technology Works</h2>
          <p className="text-lg text-gray-600 mb-6">
            HeadcraftAI uses state-of-the-art deep learning models that have been trained on thousands of professional headshots. Our AI can understand lighting, composition, and professional styling to transform your casual photos into polished headshots suitable for LinkedIn, resumes, company websites, and more.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">Privacy & Security</h2>
          <p className="text-lg text-gray-600 mb-6">
            We take your privacy seriously. All uploaded photos are processed securely, and we do not use your images for training our AI or share them with third parties without explicit consent. Your data is yours, and we&apos;re committed to keeping it that way.
          </p>
        </div>
      </div>
    </Layout>
  );
} 