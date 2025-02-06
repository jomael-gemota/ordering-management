const initRoutes = ({ app }) => {
    app.use('/', require('./home.route'));
    app.use('/api', require('./home.route'));
    app.use('/api/invoice-audit-records', require('../routes/invoice-audit-records.route'));

    app.use((error, req, res, next) => 
        res.status(error.status || 500).json({
            message: error.message || 'Ordering Management Route: Something went wrong!'
        })
    );
};

module.exports = { initRoutes };