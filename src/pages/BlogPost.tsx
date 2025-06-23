
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CalendarDays, Clock, User, Share2 } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const blogPosts = {
    'discreet-companion-eldoret': {
      title: 'How to Book a Discreet Companion in Eldoret',
      content: `
        <h2>Understanding Professional Companionship in Eldoret</h2>
        <p>Eldoret, as a growing urban center in Kenya, offers various professional companionship services for discerning individuals seeking quality company for social events, business functions, or personal engagements.</p>
        
        <h3>1. Research Reputable Platforms</h3>
        <p>Start by using established platforms like EldoVibes that verify their companions and maintain high standards of professionalism and discretion.</p>
        
        <h3>2. Verify Credentials</h3>
        <p>Always ensure that the companion service you choose has proper verification processes and maintains professional standards.</p>
        
        <h3>3. Clear Communication</h3>
        <p>Be clear about your expectations, the nature of the engagement, and any specific requirements you may have.</p>
        
        <h3>4. Privacy and Discretion</h3>
        <p>Professional services prioritize client privacy and maintain strict confidentiality standards.</p>
        
        <h3>5. Safety First</h3>
        <p>Always prioritize safety by meeting in public places initially and using secure communication channels.</p>
      `,
      author: 'EldoVibes Team',
      date: '2025-01-15',
      readTime: '5 min read',
      category: 'Guides'
    },
    'travel-partner-tips': {
      title: '5 Things to Know Before Booking a Travel Partner',
      content: `
        <h2>Essential Considerations for Travel Companionship</h2>
        
        <h3>1. Define Your Travel Needs</h3>
        <p>Consider whether you need a companion for business events, leisure travel, or cultural experiences in Kenya.</p>
        
        <h3>2. Professional Standards</h3>
        <p>Ensure your travel partner maintains professional demeanor and is comfortable in various social settings.</p>
        
        <h3>3. Travel Documentation</h3>
        <p>Verify that your companion has proper travel documentation if international travel is involved.</p>
        
        <h3>4. Cultural Awareness</h3>
        <p>Choose someone who understands local customs and can enhance your travel experience in Kenya.</p>
        
        <h3>5. Clear Arrangements</h3>
        <p>Establish clear terms regarding travel expenses, accommodation arrangements, and duration of service.</p>
      `,
      author: 'EldoVibes Team',
      date: '2025-01-10',
      readTime: '4 min read',
      category: 'Travel'
    },
    'dinner-companion-etiquette': {
      title: 'The Art of Choosing a Dinner Companion in Eldoret',
      content: `
        <h2>Selecting the Perfect Dinner Companion</h2>
        
        <h3>Understanding Social Dynamics</h3>
        <p>A good dinner companion enhances your social presence and contributes meaningfully to conversations.</p>
        
        <h3>Professional Presentation</h3>
        <p>Look for companions who dress appropriately for different venues and occasions in Eldoret's diverse dining scene.</p>
        
        <h3>Conversation Skills</h3>
        <p>The ideal companion should be well-versed in various topics and able to engage in meaningful dialogue.</p>
        
        <h3>Cultural Sensitivity</h3>
        <p>Choose someone who respects local customs and can navigate Eldoret's social environment with ease.</p>
      `,
      author: 'EldoVibes Team',
      date: '2025-01-08',
      readTime: '6 min read',
      category: 'Social'
    }
  };

  const post = blogPosts[slug as keyof typeof blogPosts];

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <article className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary">{post.category}</Badge>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              
              <CardTitle className="text-3xl font-bold leading-tight">
                {post.title}
              </CardTitle>
              
              <div className="flex items-center gap-6 text-gray-600 mt-4">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {post.author}
                </div>
                <div className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  {new Date(post.date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {post.readTime}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </CardContent>
          </Card>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
