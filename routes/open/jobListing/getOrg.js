import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import Organization from '../../../schema/organization.js';

export default async function getOrg(req, res, next) {
    try {
        const name = req.query.name;

        if (!name) {
            return res.status(400).json({ error: 'Organization name is required' });
        }

        const organization = await Organization.findOne({ name });

        if (!organization) {
            return res.status(401).json({ error: 'Organization not found' });
        }

        res.json({ organization });
    } catch (error) {
        console.error('Error fetching organization:', error);
        res.status(500).json({ error: 'Failed to fetch organization' });
    }
}
