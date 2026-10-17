import User from '../models/User.js';
import Job from '../models/Job.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role;
    }

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: users.length,
      total: totalUsers,
      page,
      pages: Math.ceil(totalUsers / limit) || 1,
      users
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      adminUsers,
      totalJobs,
      completedJobs,
      failedJobs
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'suspended' }),
      User.countDocuments({ role: 'admin' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'completed' }),
      Job.countDocuments({ status: 'failed' })
    ]);

    const recentUsers = await User.find()
      .select('name email role status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        adminUsers,
        totalJobs,
        completedJobs,
        failedJobs,
        recentUsers
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const jobCount = await Job.countDocuments({ userId: user._id.toString() });

    return res.status(200).json({
      success: true,
      user,
      jobCount
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { role, status, credits, name, email } = req.body;

    if (user._id.toString() === req.user.id) {
      if (role && role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'You cannot revoke your own admin privileges.'
        });
      }
      if (status && status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'You cannot suspend or deactivate your own account.'
        });
      }
    }

    if (role && ['user', 'admin'].includes(role)) {
      user.role = role;
    }

    if (status && ['active', 'suspended', 'inactive'].includes(status)) {
      user.status = status;
    }

    if (typeof credits === 'number' && credits >= 0) {
      user.credits = credits;
    }

    if (name) {
      user.name = name.trim();
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email address already in use by another user.'
        });
      }
      user.email = email.toLowerCase().trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        credits: user.credits,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: `User '${user.name}' has been deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
};
