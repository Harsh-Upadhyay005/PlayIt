import mongoose, {Schema} from 'mongoose';
import mongooseaggregatePaginate from 'mongoose-aggregate-paginate-v2';

import {User} from './user.models.js';
import {Comment} from './comment.models.js';
import {Like} from './like.models.js';
import {Dislike} from './dislike.models.js';
import {Subscription} from './subscription.models.js';
import {Notification} from './notification.models.js';
import {Playlist} from './playlist.models.js';

const videoSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: false,
            trim: true,
        },
        videoFile: {
            type: String, // cloudinary URL
            required: true,
        },
        thumbnail: {
            type: String, // cloudinary URL
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
    },
    {timestamps: true}
);

videoSchema.plugin(mongooseaggregatePaginate);

export const Video = mongoose.model('Video', videoSchema);