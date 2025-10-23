
class SiteController {
    // [GET] /
    async index(req, res, next) {
        try {
            res.render('home');
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    }
}

module.exports = new SiteController();
