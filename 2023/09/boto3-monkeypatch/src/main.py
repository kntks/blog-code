import json
from datetime import date, datetime
from example import Example

def json_serial(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))


ex = Example()

print(json.dumps(ex.get_roles(), default=json_serial))