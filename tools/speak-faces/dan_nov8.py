"""Opening day, last pass (Nov 8, 9:50): Dan's face from his portrait (ref/dan-portrait-nov8.jpg), hall and stage.
Same recipe as faces_nov8.py (transplant, two identity passes, gentle GPEN), only Dan, only the new reference.
Run:  python3 tools/speak-faces/dan_nov8.py <in.png> <out.png> <x,y of Dan's face>"""
import os, sys, cv2
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import faces_nov8 as F
F.REF['dan'] = F.load_ref('dan-portrait-nov8.jpg')
F.ID['dan'] = F.fk.identity([os.path.join(F.REFD, 'dan-portrait-nov8.jpg')])
if __name__ == '__main__':
    src, dst, xy = sys.argv[1], sys.argv[2], [float(v) for v in sys.argv[3].split(',')]
    im = cv2.imread(src); f = F.nearest(F.fk.faces(im), xy)
    b = F.score(im, f, 'dan'); im = F.recipe(im, f, 'dan')
    print('dan likeness', round(b, 2), '->', round(F.score(im, f, 'dan'), 2), flush=True)
    cv2.imwrite(dst, im)
