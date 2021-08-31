class API_features {
  constructor(query, reqBodyQueryObject) {
    this.query = query;
    this.reqBodyQueryObject = reqBodyQueryObject;
  }
  filter() {
    const queryObj = { ...this.reqBodyQueryObject };

    const excludedQueries = ['page', 'sort', 'limit', 'fields'];
    excludedQueries.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lt|gt|lte|gte)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.reqBodyQueryObject.sort) {
      const sortQueries = this.reqBodyQueryObject.sort.split(',').join(' ');
      console.log(this.reqBodyQueryObject.sort);
      this.query = this.query.sort(sortQueries);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  selectFields() {
    if (this.reqBodyQueryObject.fields) {
      const fieldsQueries = this.reqBodyQueryObject.fields.split(',').join(' ');
      this.query = this.query.select(fieldsQueries);
    }
    return this;
  }
  paginate() {
    const limit = this.reqBodyQueryObject.limit * 1 || 20;
    const page = this.reqBodyQueryObject.page * 1 || 1;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = API_features;
