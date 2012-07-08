/*jshint globalstrict:true, sub:true*/
/*globals XSS*/

'use strict';

/**
 * Client data
 * @param id {Number}
 * @constructor
 */
function Client(id) {
    this.id = id;
    console.log('I AM', id);
}

Client.prototype = {

};