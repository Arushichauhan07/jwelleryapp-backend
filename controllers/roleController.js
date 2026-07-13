const Role = require("../models/Role");

const createRole = async (req, res) => {
    try {

        const { role, permissions } = req.body;

        if (!role || !permissions) {
            return res.status(400).json({
                success: false,
                message: "Role and permissions are required"
            });
        }

        // Check if role already exists
        const existingRole = await Role.findOne({ role });

        if (existingRole) {
            return res.status(400).json({
                success: false,
                message: "Role already exists"
            });
        }

        const newRole = await Role.create({
            role,
            permissions
        });

        res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: newRole
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Error creating role",
            error: error.message
        });
    }
};

module.exports = {createRole};