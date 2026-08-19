import datetime
from bson import ObjectId

def serialize_doc(doc):
    """Recursively converts MongoDB ObjectId and datetime objects into JSON-serializable primitives."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if key == "_id" and isinstance(value, ObjectId):
                result["id"] = str(value)
                result["_id"] = str(value)
            elif isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, (datetime.datetime, datetime.date)):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = [serialize_doc(v) for v in value]
            else:
                result[key] = value
        return result
    if isinstance(doc, ObjectId):
        return str(doc)
    if isinstance(doc, (datetime.datetime, datetime.date)):
        return doc.isoformat()
    return doc

def serialize_docs(cursor):
    """Converts a MongoDB cursor or list of dicts to JSON-serializable list."""
    return [serialize_doc(doc) for doc in cursor]

def format_inr(amount):
    """Formats a number in Indian Rupee format e.g. 2,50,000"""
    try:
        val = float(amount)
        # Indian numbering format
        s = f"{val:.2f}"
        parts = s.split(".")
        integer_part = parts[0]
        decimal_part = parts[1]
        
        if len(integer_part) <= 3:
            formatted = integer_part
        else:
            last3 = integer_part[-3:]
            remaining = integer_part[:-3]
            # split remaining in pairs of 2
            chunks = []
            while remaining:
                chunks.insert(0, remaining[-2:])
                remaining = remaining[:-2]
            formatted = ",".join(chunks) + "," + last3
            
        return f"₹{formatted}" if decimal_part == "00" else f"₹{formatted}.{decimal_part}"
    except Exception:
        return f"₹{amount}"

def sanitize_mobile(mobile: str) -> str:
    """Cleans phone numbers to 10 digits."""
    if not mobile:
        return ""
    cleaned = "".join(filter(str.isdigit, str(mobile)))
    if len(cleaned) > 10 and cleaned.startswith("91"):
        cleaned = cleaned[2:]
    return cleaned[-10:] if len(cleaned) >= 10 else cleaned
