from skyfield.api import load
from skyfield import almanac, eclipselib
from skyfield.framelib import ecliptic_frame
import numpy as np, json
ts=load.timescale(); eph=load('de440s.bsp')
earth=eph['earth']
S=['Bélier','Taureau','Gémeaux','Cancer','Lion','Vierge','Balance','Scorpion','Sagittaire','Capricorne','Verseau','Poissons']
P={'Mercure':'mercury','Vénus':'venus','Mars':'mars barycenter','Jupiter':'jupiter barycenter','Saturne':'saturn barycenter','Uranus':'uranus barycenter','Neptune':'neptune barycenter','Pluton':'pluto barycenter'}
def lon(body,t):
    _,l,_=earth.at(t).observe(eph[body]).apparent().frame_latlon(ecliptic_frame); return l.degrees
t0=ts.utc(2026,12,1); t1=ts.utc(2028,1,31)
out={}
def fmt(t): return t.utc_strftime('%Y-%m-%d %H:%M UTC')
for name,b in P.items():
    f=lambda t: (lon(b,t)//30).astype(int); f.step_days=0.5
    tt,v=almanac.find_discrete(ts.utc(2027,1,1),ts.utc(2028,1,1),f)
    ing=[(fmt(t),S[x],round(float(lon(b,t)),2)) for t,x in zip(tt,v)]
    def g(t):
        d=(lon(b,ts.tt_jd(t.tt+0.01))-lon(b,ts.tt_jd(t.tt-0.01)))%360
        return (d<180).astype(int)
    g.step_days=1
    tt,v=almanac.find_discrete(t0,t1,g)
    st=[(fmt(t),'directe' if x else 'rétrograde',S[int(lon(b,t)//30)],round(float(lon(b,t)%30),1)) for t,x in zip(tt,v)]
    sl=S[int(lon(b,ts.utc(2027,1,1))//30)]
    out[name]={'sign_jan1':sl,'ingresses':ing,'stations':st}
tt,y,d=eclipselib.lunar_eclipses(ts.utc(2027,1,1),ts.utc(2028,1,1),eph)
out['lunar']=[(fmt(t),eclipselib.LUNAR_ECLIPSES[k],S[int(lon('moon',t)//30)]) for t,k in zip(tt,y)]
# solar: new moons with small moon ecliptic latitude
tt,ph=almanac.find_discrete(ts.utc(2027,1,1),ts.utc(2028,1,1),almanac.moon_phases(eph))
sol=[]
for t,p in zip(tt,ph):
    if p==0:
        _,_,_=0,0,0
        lat=earth.at(t).observe(eph['moon']).apparent().frame_latlon(ecliptic_frame)[0].degrees
        if abs(lat)<1.6: sol.append((fmt(t),round(float(lat),2),S[int(lon('sun',t)//30)],round(float(lon('sun',t)%30),1)))
out['solar_newmoons']=sol
print(json.dumps(out,ensure_ascii=False,indent=1))
json.dump(out,open('dates2027.json','w'),ensure_ascii=False,indent=1)
