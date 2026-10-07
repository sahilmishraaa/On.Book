import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        const { name = '', username, email, password, cpassword, role = 'reader' } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Name, username, email and password are required' });
        }

        if (username.length > 15 || !/^\w+$/.test(username)) {
            return res.status(400).json({ message: 'Username must be alphanumeric and <= 15 characters' });
        }

        if (password !== cpassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({
            $or: [{ username }, { email: email.toLowerCase() }],
        });

        if (existingUser) {
            return res.status(409).json({ message: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const assignedRole = role === 'creator' ? 'creator' : 'reader';

        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            role: assignedRole,
        });

        res.status(201).json({
            token: signToken(user),
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                bio: user.bio,
                avatar: user.avatar,
            }
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid Credentials, Please try again.' });
        }

        res.json({
            token: signToken(user),
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                bio: user.bio,
                avatar: user.avatar,
            }
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Get Current User Profile
router.get('/me', auth, (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            name: req.user.name,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
            bio: req.user.bio,
            avatar: req.user.avatar,
        },
    });
});

export default router;