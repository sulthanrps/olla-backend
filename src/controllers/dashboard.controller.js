const { pool, sql } = require('../config/db');

exports.getDashboardSummary = async (req, res) => {
    const period = req.query.period || '7days';

    let dateColumn, groupByClause, whereClause;

    switch (period) {
        case 'annually':
            dateColumn = `FORMAT(t.tanggal, 'yyyy-MM') AS tanggal`;
            groupByClause = `GROUP BY FORMAT(t.tanggal, 'yyyy-MM')`;
            whereClause = `WHERE YEAR(t.tanggal) = YEAR(GETDATE())`;
            break;

        case 'monthly':
            dateColumn = `CAST(t.tanggal AS DATE) AS tanggal`;
            groupByClause = `GROUP BY CAST(t.tanggal AS DATE)`;
            whereClause = `WHERE MONTH(t.tanggal) = MONTH(GETDATE()) AND YEAR(t.tanggal) = YEAR(GETDATE())`;
            break;

        default:
            dateColumn = `CAST(t.tanggal AS DATE) AS tanggal`;
            groupByClause = `GROUP BY CAST(t.tanggal AS DATE)`;
            whereClause = `WHERE t.tanggal >= DATEADD(day, -7, GETDATE())`;
            break;
    }

    try {
        const dailyStatsQuery = `
            SELECT 
                ${dateColumn},
                COUNT(t.id_transaction) AS jumlah_transaksi,
                SUM(p.harga * t.qty) AS total_revenue
            FROM 
                transactions t
            JOIN 
                products p ON t.id_product = p.id_product
            ${whereClause}
            ${groupByClause}
            ORDER BY 
                tanggal ASC;
        `;
        
        const totalSummaryQuery = `
            SELECT
                COUNT(t.id_transaction) AS total_transactions,
                SUM(p.harga * t.qty) AS total_revenue
            FROM
                transactions t
            JOIN 
                products p ON t.id_product = p.id_product
            ${whereClause};
        `;
        
        const request = pool.request(); 
        const dailyStatsResult = await request.query(dailyStatsQuery);
        const totalSummaryResult = await request.query(totalSummaryQuery);

        res.status(200).json({
            status: 'success',
            data: {
                dailyStats: dailyStatsResult.recordset,
                summary: totalSummaryResult.recordset[0]
            }
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: `Server Error: ${error.message}` });
    }
};