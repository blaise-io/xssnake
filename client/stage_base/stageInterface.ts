/**
 * @interface
 */
StageInterface = function() {
};



    /** @return {Shape} */
    getShape() {
        return new Shape();
    }

    /** @return {Object} */
    getData() {
        return {};
    }

    /** @return */
    construct() {}

    /** @return */
    destruct() {}

};
