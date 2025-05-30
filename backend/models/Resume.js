const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  personalInfo: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    github: {
      type: String,
      trim: true
    },
    summary: {
      type: String,
      maxlength: 500
    }
  },
  
  experience: [{
    company: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    current: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      maxlength: 1000
    },
    achievements: [{
      type: String,
      maxlength: 200
    }],
    technologies: [{
      type: String,
      trim: true
    }],
    confidential: {
      type: Boolean,
      default: false
    }
  }],
  
  education: [{
    institution: {
      type: String,
      required: true,
      trim: true
    },
    degree: {
      type: String,
      required: true,
      trim: true
    },
    field: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    gpa: {
      type: String,
      trim: true
    },
    honors: [{
      type: String,
      trim: true
    }],
    relevantCourses: [{
      type: String,
      trim: true
    }]
  }],
  
  skills: {
    technical: [{
      category: {
        type: String,
        required: true,
        trim: true
      },
      skills: [{
        name: {
          type: String,
          required: true,
          trim: true
        },
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'intermediate'
        },
        yearsOfExperience: {
          type: Number,
          min: 0
        }
      }]
    }],
    soft: [{
      type: String,
      trim: true
    }],
    languages: [{
      language: {
        type: String,
        required: true,
        trim: true
      },
      proficiency: {
        type: String,
        enum: ['basic', 'conversational', 'fluent', 'native'],
        default: 'conversational'
      }
    }]
  },
  
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      required: true,
      trim: true
    },
    issueDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    credentialId: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      trim: true
    }
  }],
  
  awards: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date
    },
    description: {
      type: String,
      maxlength: 300
    }
  }],
  
  publications: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    authors: [{
      type: String,
      trim: true
    }],
    publication: {
      type: String,
      trim: true
    },
    date: {
      type: Date
    },
    url: {
      type: String,
      trim: true
    },
    doi: {
      type: String,
      trim: true
    }
  }],
  
  metadata: {
    version: {
      type: String,
      default: '1.0'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    confidentialityLevel: {
      type: String,
      enum: ['public', 'restricted', 'confidential'],
      default: 'confidential'
    }
  }
}, {
  timestamps: true
});

// Update lastUpdated on save
resumeSchema.pre('save', function(next) {
  this.metadata.lastUpdated = new Date();
  next();
});

// Method to get public version of resume
resumeSchema.methods.getPublicVersion = function() {
  const resume = this.toObject();
  
  // Filter out confidential experience
  resume.experience = resume.experience.filter(exp => !exp.confidential);
  
  // Remove sensitive personal info if confidential
  if (this.metadata.confidentialityLevel === 'confidential') {
    delete resume.personalInfo.phone;
    delete resume.personalInfo.email;
  }
  
  return resume;
};

// Static method to get active resume
resumeSchema.statics.getActive = function() {
  return this.findOne({ 'metadata.isActive': true });
};

module.exports = mongoose.model('Resume', resumeSchema);
