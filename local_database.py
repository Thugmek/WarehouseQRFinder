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

def get_warehouse_items():
   querry = warehouse_items.select()
   conn = db_engine.connect()
   result = conn.execute(querry)
   rows = []
   for row in result:
      rows.append(row)
   return rows

add_warehouse_item(name="Šroub M4", description="Popis šroubu M4")
#print("Get warehouse items:")
#print(get_warehouse_items())