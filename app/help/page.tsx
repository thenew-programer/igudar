'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  HelpCircle, 
  Search, 
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Video,
  Book,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  Headphones,
  Globe,
  Shield,
  DollarSign,
  Building2,
  TrendingUp,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: '',
    description: ''
  });

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'getting-started', name: 'Getting Started', icon: Book },
    { id: 'investments', name: 'Investments', icon: TrendingUp },
    { id: 'account', name: 'Account & Profile', icon: Users },
    { id: 'payments', name: 'Payments & Billing', icon: DollarSign },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'properties', name: 'Properties', icon: Building2 }
  ];

  const faqs = [
    {
      id: '1',
      category: 'getting-started',
      question: 'How do I start investing in real estate?',
      answer: 'To start investing, create an account, complete your profile verification, browse available properties, and make your first investment. The minimum investment is typically 1,000 MAD.',
      helpful: 45,
      notHelpful: 3
    },
    {
      id: '2',
      category: 'investments',
      question: 'What is the minimum investment amount?',
      answer: 'The minimum investment varies by property but is typically 1,000 MAD. Some premium properties may have higher minimums. You can see the minimum investment for each property on its detail page.',
      helpful: 38,
      notHelpful: 2
    },
    {
      id: '3',
      category: 'investments',
      question: 'How are returns calculated and distributed?',
      answer: 'Returns are calculated based on rental income and property appreciation. Dividends are typically distributed quarterly, and you can track your returns in real-time through your dashboard.',
      helpful: 52,
      notHelpful: 1
    },
    {
      id: '4',
      category: 'security',
      question: 'How secure is my investment and personal data?',
      answer: 'We use bank-level security with 256-bit SSL encryption, two-factor authentication, and comply with international data protection standards. Your investments are also protected by regulatory oversight.',
      helpful: 67,
      notHelpful: 0
    },
    {
      id: '5',
      category: 'payments',
      question: 'What payment methods are accepted?',
      answer: 'We accept major credit cards, bank transfers, and mobile payments. All transactions are processed securely through our certified payment partners.',
      helpful: 29,
      notHelpful: 4
    },
    {
      id: '6',
      category: 'account',
      question: 'How do I verify my account?',
      answer: 'Account verification requires a valid ID document and proof of address. The process typically takes 24-48 hours. You\'ll receive email updates on your verification status.',
      helpful: 41,
      notHelpful: 2
    }
  ];

  const quickActions = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      action: 'Start Chat',
      available: true,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      title: 'Phone Support',
      description: 'Call us for urgent matters',
      icon: Phone,
      action: '+212 5XX XXX XXX',
      available: true,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: Mail,
      action: 'support@igudar.com',
      available: true,
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      title: 'Video Call',
      description: 'Schedule a video consultation',
      icon: Video,
      action: 'Schedule Call',
      available: false,
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    }
  ];

  const resources = [
    {
      title: 'Investment Guide',
      description: 'Complete guide to real estate investing',
      type: 'PDF Guide',
      icon: FileText,
      downloadUrl: '#'
    },
    {
      title: 'Platform Tutorial',
      description: 'Video walkthrough of the platform',
      type: 'Video',
      icon: Video,
      downloadUrl: '#'
    },
    {
      title: 'Risk Assessment',
      description: 'Understanding investment risks',
      type: 'Article',
      icon: Book,
      downloadUrl: '#'
    },
    {
      title: 'Tax Information',
      description: 'Tax implications of real estate investing',
      type: 'PDF Guide',
      icon: FileText,
      downloadUrl: '#'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTicketSubmit = () => {
    console.log('Support ticket submitted:', ticketForm);
    // Handle ticket submission
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleFeedback = (faqId: string, helpful: boolean) => {
    console.log(`FAQ ${faqId} marked as ${helpful ? 'helpful' : 'not helpful'}`);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-igudar-text">
            Help & Support Center
          </h1>
          <p className="text-lg text-igudar-text-secondary max-w-2xl mx-auto">
            Find answers to your questions, get help with your account, and learn how to make the most of your investments
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-igudar-text-muted" />
            <Input
              placeholder="Search for help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className={`hover:shadow-md transition-shadow cursor-pointer ${!action.available ? 'opacity-60' : ''}`}>
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${action.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-igudar-text mb-2">{action.title}</h3>
                  <p className="text-sm text-igudar-text-muted mb-4">{action.description}</p>
                  <Button 
                    variant={action.available ? "default" : "outline"} 
                    size="sm" 
                    className={action.available ? "bg-igudar-primary hover:bg-igudar-primary/90 text-white" : ""}
                    disabled={!action.available}
                  >
                    {action.action}
                    {action.available && <ArrowRight className="ml-2 h-3 w-3" />}
                  </Button>
                  {!action.available && (
                    <p className="text-xs text-igudar-text-muted mt-2">Coming Soon</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-igudar-text">Browse by Category</CardTitle>
                <CardDescription>
                  Find help articles organized by topic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors text-left ${
                          isSelected 
                            ? 'border-igudar-primary bg-igudar-primary/5 text-igudar-primary' 
                            : 'border-border hover:bg-gray-50 text-igudar-text'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* FAQs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-igudar-text">Frequently Asked Questions</CardTitle>
                <CardDescription>
                  {filteredFAQs.length} questions found
                  {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-igudar-primary/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-igudar-text mb-2">No FAQs Found</h3>
                    <p className="text-igudar-text-muted">
                      Try adjusting your search or browse a different category.
                    </p>
                  </div>
                ) : (
                  filteredFAQs.map((faq) => (
                    <div key={faq.id} className="border border-border rounded-lg">
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="font-medium text-igudar-text pr-4">{faq.question}</h3>
                        {expandedFAQ === faq.id ? (
                          <ChevronDown className="h-5 w-5 text-igudar-text-muted flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-igudar-text-muted flex-shrink-0" />
                        )}
                      </button>
                      
                      {expandedFAQ === faq.id && (
                        <div className="px-4 pb-4">
                          <Separator className="mb-4" />
                          <p className="text-igudar-text-secondary mb-4">{faq.answer}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-igudar-text-muted">Was this helpful?</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleFeedback(faq.id, true)}
                                  className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors"
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                  <span className="text-sm">{faq.helpful}</span>
                                </button>
                                <button
                                  onClick={() => handleFeedback(faq.id, false)}
                                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                  <span className="text-sm">{faq.notHelpful}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Submit Ticket */}
            <Card>
              <CardHeader>
                <CardTitle className="text-igudar-text">Submit a Support Ticket</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Send us a message and we'll get back to you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={ticketForm.category} onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">Account Issues</SelectItem>
                        <SelectItem value="investment">Investment Questions</SelectItem>
                        <SelectItem value="payment">Payment Problems</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide as much detail as possible about your issue..."
                    rows={4}
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <Button 
                  onClick={handleTicketSubmit}
                  className="bg-igudar-primary hover:bg-igudar-primary/90 text-white"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit Ticket
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Support Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-igudar-text">Support Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-igudar-text-secondary">Live Chat</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Online
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-igudar-text-secondary">Phone Support</span>
                  <span className="text-sm text-igudar-text">9 AM - 6 PM</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-igudar-text-secondary">Email Response</span>
                  <span className="text-sm text-igudar-text">Within 24h</span>
                </div>

                <Separator />

                <div className="text-center">
                  <Clock className="h-8 w-8 text-igudar-primary mx-auto mb-2" />
                  <p className="text-sm text-igudar-text-secondary">
                    Monday - Friday<br />
                    9:00 AM - 6:00 PM (GMT+1)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-igudar-text">Helpful Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resources.map((resource, index) => {
                  const Icon = resource.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="p-2 bg-igudar-primary/10 rounded-lg">
                        <Icon className="h-4 w-4 text-igudar-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-igudar-text text-sm">{resource.title}</h4>
                        <p className="text-xs text-igudar-text-muted">{resource.description}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {resource.type}
                        </Badge>
                      </div>
                      <ExternalLink className="h-4 w-4 text-igudar-text-muted" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-igudar-text">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-igudar-text">Phone</div>
                    <div className="text-sm text-igudar-text-muted">+212 5XX XXX XXX</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-igudar-text">Email</div>
                    <div className="text-sm text-igudar-text-muted">support@igudar.com</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Globe className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-igudar-text">Website</div>
                    <div className="text-sm text-igudar-text-muted">www.igudar.com</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Satisfaction */}
            <Card className="bg-gradient-to-br from-igudar-primary/5 to-igudar-primary/10 border-igudar-primary/20">
              <CardHeader>
                <CardTitle className="text-igudar-text flex items-center">
                  <Star className="mr-2 h-5 w-5 text-igudar-primary" />
                  Customer Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-igudar-primary mb-2">4.8/5</div>
                  <div className="flex justify-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-igudar-text-secondary">
                    Based on 1,247 reviews
                  </p>
                </div>
                <p className="text-xs text-igudar-text-muted text-center">
                  "Excellent support team that really cares about helping investors succeed."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}