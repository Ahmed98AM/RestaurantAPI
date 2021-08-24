class API_features {
  constructor(queryCollection, queryString) {
    this.queryCollection = queryCollection;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const excludedQueries = ['page', 'sort', 'limit', 'fields'];
    excludedQueries.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lt|gt|lte|gte)\b/g, (match) => `$${match}`);
    this.queryCollection = this.queryCollection.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortQueries = this.queryString.sort.split(',').join(' ');
      this.queryCollection = this.queryCollection.sort(sortQueries);
    } else {
      this.queryCollection = this.queryCollection.sort('-createdAt');
    }
    return this;
  }
  selectFields() {
    if (this.queryString.fields) {
      const fieldsQueries = this.queryString.fields.split(',').join(' ');
      this.queryCollection = this.queryCollection.select(fieldsQueries);
    } else {
      this.queryCollection = this.queryCollection.select('-__v');
    }
    return this;
  }
  paginate() {
    const limit = this.queryString.limit * 1;
    const page = this.queryString.page * 1;
    const skip = (page - 1) * limit;
    this.queryCollection = this.queryCollection.skip(skip).limit(limit);
    return this;
  }
}
module.exports = API_features;
