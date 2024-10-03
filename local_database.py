from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String
from sqlalchemy.sql import text
from sqlalchemy.dialects.mysql import TEXT, LONGTEXT
import meilisearch

db_engine = create_engine('mysql+pymysql://warefinder:warefinder@warefinder.local/warefinder', echo=True)
meilisearch_client = meilisearch.Client('http://warefinder.local:7700', 'Trilab365')
meta = MetaData()

warehouse_items = Table(
   'warehouse_items', meta,
   Column('id', Integer, primary_key=True, autoincrement=True),
   Column('name', String(128)),
   Column('description', TEXT),
   Column('position', String(16)),
   Column('image', LONGTEXT),
)
meta.create_all(db_engine)

def add_warehouse_item(name, description=None, position=None, image=None):
   ins = warehouse_items.insert().values(name=name, description=description, position=position, image=image)
   conn = db_engine.connect()
   result = conn.execute(ins)
   result = conn.execute(text("SELECT LAST_INSERT_ID();"))
   last_id = result.fetchone()[0]
   meilisearch_client.index('warefinder_warehouse_items').add_documents({
      "id": last_id,
      "name": name,
      "description": description
   })
   conn.commit()

def update_warehouse_item(id, updated_fields):
   ins = warehouse_items.update().values(**updated_fields).where(warehouse_items.c.id == id)
   print(ins)
   conn = db_engine.connect()
   result = conn.execute(ins)
   querry = warehouse_items.select().where(warehouse_items.c.id == id)
   result = conn.execute(querry)
   result = result.fetchone()
   meilisearch_client.index('warefinder_warehouse_items').add_documents({
      "id": result[0],
      "name": result[1],
      "description": result[2]
   })
   conn.commit()

def remove_warehouse_item(id):
   ins = warehouse_items.delete().where(warehouse_items.c.id == id)
   print(ins)
   conn = db_engine.connect()
   result = conn.execute(ins)
   meilisearch_client.index('warefinder_warehouse_items').delete_document(id)
   conn.commit()

def get_warehouse_items():
   querry = warehouse_items.select()
   conn = db_engine.connect()
   result = conn.execute(querry)
   rows = []
   for row in result:
      rows.append(row)
   return rows

def fulltext_search(searched_string, in_boxes=True, not_in_boxes=False):
   result = meilisearch_client.index('warefinder_warehouse_items').search(searched_string)
   if not result['hits']:
      return {
         "rows": []
      }
   ids = ""
   for hit in result['hits']:
      ids = f"{ids}{hit['id']}, "
   ids = ids[:-2]
   conn = db_engine.connect()
   result = conn.execute(text(f"SELECT * FROM warefinder.warehouse_items WHERE id IN ({ids}) ORDER BY FIELD(id, {ids});"))
   rows = []
   for row in result:
      rows.append({
         "id": row[0],
         "name": row[1],
         "description": row[2],
         "position": row[3],
         "image": row[4]
      })
   return {
      "rows": rows
   }

#add_warehouse_item(name="Banán", description="Zahnuté ovoce žluté barvy")
#print("fulltext_search:")
#print(fulltext_search(""))
#update_warehouse_item(13,{"description":"RPi 4B, jednodeskový počítač, SBC"})
