Colleague

```javascript
// Currrently.
var Colleague = require('colleague')
var colleague = new Colleague(process)

// Probably better.
var colleague = Colleague.listen(process)

colleague.spigot.emptyInto(consumerOfSorts)
```

Some thoughts on construction above.
