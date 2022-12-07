'use strict';

const Sequelize = require('sequelize');
const { Model, DataTypes } = Sequelize;

module.exports = (sequelize) => {
    class User extends Model {}
    User.init({
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A first name is required'
                },
                notEmpty: {
                    msg: 'Please provide a first name'
                }
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A last name is required'
                },
                notEmpty: {
                    msg: 'Please provide a last name'
                }
            }
        },
        emailAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'An email address is required'
                },
                notEmpty: {
                    msg: 'Please provide an email address'
                },
                isEmail: {
                    msg: 'Please provide a valid email: Format should look like user@website.com'
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A password is required — Password must be between 8 and 20 characters in length'
                },
                notEmpty: {
                    msg: 'Please provide a password — Password must be between 8 and 20 characters in length'
                },
                len: {
                    args: [8, 20],
                    msg: 'Password must be between 8 and 20 characters in length'
                }
            }
        },
    }, { sequelize });

    User.associate = (models) => {
        User.hasMany(models.Course, {
            as: 'user',
            foreignKey: {
                fieldName: 'userId',
                field: 'userId',
                allowNull: false
            },
        })
    };

    return User;
}