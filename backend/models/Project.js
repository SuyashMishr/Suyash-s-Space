const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  longDescription: {
    type: String,
    maxlength: 2000
  },
  technologies: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['web', 'mobile', 'desktop', 'ai', 'data', 'other']
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'planned'],
    default: 'completed'
  },
  featured: {
    type: Boolean,
    default: false
  },
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  links: {
    github: String,
    live: String,
    demo: String,
    documentation: String
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  challenges: [{
    type: String,
    maxlength: 300
  }],
  solutions: [{
    type: String,
    maxlength: 300
  }],
  learnings: [{
    type: String,
    maxlength: 300
  }],
  metrics: {
    performance: String,
    users: Number,
    impact: String
  },
  confidential: {
    type: Boolean,
    default: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'restricted'],
    default: 'private'
  },
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  }
}, {
  timestamps: true
});

// Indexes for performance
projectSchema.index({ category: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ createdAt: -1 });

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (!this.startDate) return null;
  
  const end = this.endDate || new Date();
  const start = this.startDate;
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
  }
});

// Method to get public data (excluding confidential info)
projectSchema.methods.getPublicData = function() {
  const project = this.toObject();
  
  if (this.confidential || this.visibility === 'private') {
    // Remove sensitive information
    delete project.links.github;
    delete project.challenges;
    delete project.solutions;
    delete project.metrics;
    project.description = 'Confidential project details';
    project.longDescription = 'This project contains confidential information.';
  }
  
  return project;
};

// Static method to get featured projects
projectSchema.statics.getFeatured = function() {
  return this.find({ featured: true, status: 'completed' })
    .sort({ priority: -1, createdAt: -1 })
    .limit(6);
};

// Static method to get projects by category
projectSchema.statics.getByCategory = function(category) {
  return this.find({ category, status: 'completed' })
    .sort({ priority: -1, createdAt: -1 });
};

module.exports = mongoose.model('Project', projectSchema);
