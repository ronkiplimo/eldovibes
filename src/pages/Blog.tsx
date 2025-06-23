
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
  const navigate = useNavigate();

  const blogPosts = [
    {
      id: 'discreet-companion-eldoret',
      title: 'How to Book a Discreet Companion in Eldoret',
      description: 'A comprehensive guide to booking professional companionship services in Eldoret with complete discretion and safety.',
      author: 'EldoVibes Team',
      date: '2025-01-15',
      readTime: '5 min read',
      category: 'Guides',
      keywords: ['Eldoret escort services', 'discreet companion', 'professional companionship']
    },
    {
      id: 'travel-partner-tips',
      title: '5 Things to Know Before Booking a Travel Partner',
      description: 'Essential tips for selecting the perfect travel companion for business trips, events, or leisure travel in Kenya.',
      author: 'EldoVibes Team',
      date: '2025-01-10',
      readTime: '4 min read',
      category: 'Travel',
      keywords: ['travel escort Kenya', 'travel partner', 'companion for events']
    },
    {
      id: 'dinner-companion-etiquette',
      title: 'The Art of Choosing a Dinner Companion in Eldoret',
      description: 'Learn how to select the perfect companion for business dinners, social events, and special occasions in Eldoret.',
      author: 'EldoVibes Team',
      date: '2025-01-08',
      readTime: '6 min read',
      category: 'Social',
      keywords: ['companion for dinner Eldoret', 'social companion', 'business escort']
    },
    {
      id: 'safety-privacy-guide',
      title: 'Privacy and Safety: Your Complete Guide',
      description: 'Everything you need to know about maintaining privacy and ensuring safety when booking companionship services.',
      author: 'EldoVibes Team',
      date: '2025-01-05',
      readTime: '7 min read',
      category: 'Safety',
      keywords: ['safe escort services', 'privacy protection', 'secure booking']
    },
    {
      id: 'professional-companionship-benefits',
      title: 'The Benefits of Professional Companionship Services',
      description: 'Discover why professional companionship is becoming the preferred choice for discerning individuals in Kenya.',
      author: 'EldoVibes Team',
      date: '2025-01-01',
      readTime: '5 min read',
      category: 'Lifestyle',
      keywords: ['professional escort Kenya', 'companionship benefits', 'premium services']
    }
  ];

  const handleReadMore = (postId: string) => {
    navigate(`/blog/${postId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            EldoVibes Blog
          </h1>
          <p className="text-xl mb-6">
            Your guide to professional companionship services in Eldoret and Kenya
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <CalendarDays className="w-4 h-4 mr-1" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleReadMore(post.id)}
                    className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
                  >
                    Read More →
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
