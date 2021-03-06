FasdUAS 1.101.10   ��   ��    k             l     ��  ��    1 + `menu_click`, by Jacob Rus, September 2006     � 	 	 V   ` m e n u _ c l i c k ` ,   b y   J a c o b   R u s ,   S e p t e m b e r   2 0 0 6   
  
 l     ��������  ��  ��        l     ��  ��    I C Accepts a list of form: `{"Finder", "View", "Arrange By", "Date"}`     �   �   A c c e p t s   a   l i s t   o f   f o r m :   ` { " F i n d e r " ,   " V i e w " ,   " A r r a n g e   B y " ,   " D a t e " } `      l     ��  ��    J D Execute the specified menu item.  In this case, assuming the Finder     �   �   E x e c u t e   t h e   s p e c i f i e d   m e n u   i t e m .     I n   t h i s   c a s e ,   a s s u m i n g   t h e   F i n d e r      l     ��  ��    I C is the active application, arranging the frontmost folder by date.     �   �   i s   t h e   a c t i v e   a p p l i c a t i o n ,   a r r a n g i n g   t h e   f r o n t m o s t   f o l d e r   b y   d a t e .      l     ��������  ��  ��        i          I      �� !���� 0 
menu_click   !  "�� " o      ���� 0 mlist mList��  ��     k     T # #  $ % $ q       & & �� '�� 0 appname appName ' �� (�� 0 topmenu topMenu ( ������ 0 r  ��   %  ) * ) l     ��������  ��  ��   *  + , + l     �� - .��   -   Validate our input    . � / / &   V a l i d a t e   o u r   i n p u t ,  0 1 0 Z     2 3���� 2 A      4 5 4 n     6 7 6 1    ��
�� 
leng 7 o     ���� 0 mlist mList 5 m    ����  3 R    �� 8��
�� .ascrerr ****      � **** 8 m   
  9 9 � : : 8 M e n u   l i s t   i s   n o t   l o n g   e n o u g h��  ��  ��   1  ; < ; l   ��������  ��  ��   <  = > = l   �� ? @��   ? ; 5 Set these variables for clarity and brevity later on    @ � A A j   S e t   t h e s e   v a r i a b l e s   f o r   c l a r i t y   a n d   b r e v i t y   l a t e r   o n >  B C B r    + D E D l    F���� F n     G H G 7  �� I J
�� 
cobj I m    ����  J m    ����  H o    ���� 0 mlist mList��  ��   E J       K K  L M L o      ���� 0 appname appName M  N�� N o      ���� 0 topmenu topMenu��   C  O P O r   , ; Q R Q l  , 9 S���� S n   , 9 T U T 7 - 9�� V W
�� 
cobj V m   1 3����  W l  4 8 X���� X n  4 8 Y Z Y 1   6 8��
�� 
leng Z o   4 6���� 0 mlist mList��  ��   U o   , -���� 0 mlist mList��  ��   R o      ���� 0 r   P  [ \ [ l  < <��������  ��  ��   \  ] ^ ] l  < <�� _ `��   _ A ; This overly-long line calls the menu_recurse function with    ` � a a v   T h i s   o v e r l y - l o n g   l i n e   c a l l s   t h e   m e n u _ r e c u r s e   f u n c t i o n   w i t h ^  b c b l  < <�� d e��   d > 8 two arguments: r, and a reference to the top-level menu    e � f f p   t w o   a r g u m e n t s :   r ,   a n d   a   r e f e r e n c e   t o   t h e   t o p - l e v e l   m e n u c  g�� g O  < T h i h n  @ S j k j I   A S�� l���� 0 menu_click_recurse   l  m n m o   A B���� 0 r   n  o�� o l  B O p���� p n  B O q r q l  L O s���� s 4   L O�� t
�� 
menE t o   M N���� 0 topmenu topMenu��  ��   r n  B L u v u l  I L w���� w 4   I L�� x
�� 
mbri x o   J K���� 0 topmenu topMenu��  ��   v n  B I y z y l  F I {���� { 4   F I�� |
�� 
mbar | m   G H���� ��  ��   z l  B F }���� } 4   B F�� ~
�� 
prcs ~ o   D E���� 0 appname appName��  ��  ��  ��  ��  ��   k  f   @ A i m   < =  �                                                                                  sevs  alis    �  Macintosh HD               ��@rH+  :�System Events.app                                              N&���        ����  	                CoreServices    ��x�      ���    :�:�:�  =Macintosh HD:System: Library: CoreServices: System Events.app   $  S y s t e m   E v e n t s . a p p    M a c i n t o s h   H D  -System/Library/CoreServices/System Events.app   / ��  ��     � � � l     ��������  ��  ��   �  � � � i     � � � I      �� ����� 0 menu_click_recurse   �  � � � o      ���� 0 mlist mList �  ��� � o      ���� 0 parentobject parentObject��  ��   � k     N � �  � � � q       � � �� ��� 0 f   � ������ 0 r  ��   �  � � � l     ��������  ��  ��   �  � � � l     �� � ���   � , & `f` = first item, `r` = rest of items    � � � � L   ` f `   =   f i r s t   i t e m ,   ` r `   =   r e s t   o f   i t e m s �  � � � r      � � � n      � � � 4    �� �
�� 
cobj � m    ����  � o     ���� 0 mlist mList � o      ���� 0 f   �  � � � Z   " � ����� � ?     � � � n   
 � � � 1    
��
�� 
leng � o    ���� 0 mlist mList � m   
 ����  � r     � � � l    ����� � n     � � � 7  �� � �
�� 
cobj � m    ����  � l    ����� � n    � � � 1    ��
�� 
leng � o    ���� 0 mlist mList��  ��   � o    ���� 0 mlist mList��  ��   � o      ���� 0 r  ��  ��   �  � � � l  # #��������  ��  ��   �  � � � l  # #�� � ���   � < 6 either actually click the menu item, or recurse again    � � � � l   e i t h e r   a c t u a l l y   c l i c k   t h e   m e n u   i t e m ,   o r   r e c u r s e   a g a i n �  ��� � O   # N � � � Z   ' M � ��� � � =  ' , � � � n  ' * � � � 1   ( *��
�� 
leng � o   ' (���� 0 mlist mList � m   * +����  � k   / = � �  � � � l  / /�� � ���   � !  reveal parentObject's menu    � � � � 6   r e v e a l   p a r e n t O b j e c t ' s   m e n u �  � � � I  / 4�� ���
�� .prcsclicnull��� ��� uiel � o   / 0���� 0 parentobject parentObject��   �  � � � l  5 5� � ��   � ( " select parentObject's menu item f    � � � � D   s e l e c t   p a r e n t O b j e c t ' s   m e n u   i t e m   f �  ��~ � I  5 =�} ��|
�} .prcsclicnull��� ��� uiel � n  5 9 � � � 4   6 9�{ �
�{ 
menI � o   7 8�z�z 0 f   � o   5 6�y�y 0 parentobject parentObject�|  �~  ��   � n  @ M � � � I   A M�x ��w�x 0 menu_click_recurse   �  � � � o   A B�v�v 0 r   �  ��u � l  B I ��t�s � n  B I � � � l  F I ��r�q � 4   F I�p �
�p 
menE � o   G H�o�o 0 f  �r  �q   � n  B F � � � l  C F ��n�m � 4   C F�l �
�l 
menI � o   D E�k�k 0 f  �n  �m   � o   B C�j�j 0 parentobject parentObject�t  �s  �u  �w   �  f   @ A � m   # $ � ��                                                                                  sevs  alis    �  Macintosh HD               ��@rH+  :�System Events.app                                              N&���        ����  	                CoreServices    ��x�      ���    :�:�:�  =Macintosh HD:System: Library: CoreServices: System Events.app   $  S y s t e m   E v e n t s . a p p    M a c i n t o s h   H D  -System/Library/CoreServices/System Events.app   / ��  ��   �  � � � l     �i�h�g�i  �h  �g   �  � � � l     �f�e�d�f  �e  �d   �  � � � i     � � � I      �c ��b�c 0 executemenu executeMenu �  � � � o      �a�a 0 processname processName �  � � � o      �`�` 0 menuitemname menuItemName �  ��_ � o      �^�^ 0 menuname menuName�_  �b   � l     � � � � k      � �  � � � O      � � � I   �]�\�[
�] .miscactvnull��� ��� null�\  �[   � 4     �Z �
�Z 
capp � o    �Y�Y 0 processname processName �  � � � l   �X�W�V�X  �W  �V   �  � � � I    �U ��T�U 0 
menu_click   �  ��S � J        o    �R�R 0 processname processName  o    �Q�Q 0 menuname menuName �P o    �O�O 0 menuitemname menuItemName�P  �S  �T   �  l   �N�M�L�N  �M  �L   	 l   �K
�K  
   Reactivate if wanted:    � ,   R e a c t i v a t e   i f   w a n t e d :	  l   �J�J   ( " tell application "ShortcutWizard"    � D   t e l l   a p p l i c a t i o n   " S h o r t c u t W i z a r d "  l   �I�I    
 	activate    �    	 a c t i v a t e �H l   �G�G    	 end tell    �    e n d   t e l l�H   �   subMenuName)    � �    s u b M e n u N a m e ) �  l     �F�E�D�F  �E  �D    i     !  I     �C"�B
�C .aevtoappnull  �   � ****" J      ## $%$ o      �A�A 0 processname processName% &'& o      �@�@ 0 menuitemname menuItemName' (�?( o      �>�> 0 menuname menuName�?  �B  ! l    	)*+) L     	,, I     �=-�<�= 0 executemenu executeMenu- ./. o    �;�; 0 processname processName/ 010 o    �:�: 0 menuitemname menuItemName1 2�92 o    �8�8 0 menuname menuName�9  �<  *   subMenuName)   + �33    s u b M e n u N a m e ) 4�74 l     �6�5�4�6  �5  �4  �7       �356789�3  5 �2�1�0�/�2 0 
menu_click  �1 0 menu_click_recurse  �0 0 executemenu executeMenu
�/ .aevtoappnull  �   � ****6 �.  �-�,:;�+�. 0 
menu_click  �- �*<�* <  �)�) 0 mlist mList�,  : �(�'�&�%�( 0 mlist mList�' 0 appname appName�& 0 topmenu topMenu�% 0 r  ; 	�$ 9�# �"�!� ��
�$ 
leng
�# 
cobj
�" 
prcs
�! 
mbar
�  
mbri
� 
menE� 0 menu_click_recurse  �+ U��,m 	)j�Y hO�[�\[Zk\Zl2E[�k/E�Z[�l/E�ZO�[�\[Zm\Z��,2E�O� )�*�/�k/�/�/l+ U7 � ���=>�� 0 menu_click_recurse  � �?� ?  ��� 0 mlist mList� 0 parentobject parentObject�  = ����� 0 mlist mList� 0 parentobject parentObject� 0 f  � 0 r  > �� �����
� 
cobj
� 
leng
� .prcsclicnull��� ��� uiel
� 
menI
� 
menE� 0 menu_click_recurse  � O��k/E�O��,k �[�\[Zl\Z��,2E�Y hO� (��,k  �j O��/j Y )���/�/l+ U8 � ���
@A�	� 0 executemenu executeMenu� �B� B  ���� 0 processname processName� 0 menuitemname menuItemName� 0 menuname menuName�
  @ ���� 0 processname processName� 0 menuitemname menuItemName� 0 menuname menuNameA �� ��
� 
capp
�  .miscactvnull��� ��� null�� 0 
menu_click  �	 *�/ *j UO*���mvk+ OP9 ��!����CD��
�� .aevtoappnull  �   � ****�� ��E�� E  �������� 0 processname processName�� 0 menuitemname menuItemName�� 0 menuname menuName��  C �������� 0 processname processName�� 0 menuitemname menuItemName�� 0 menuname menuNameD ���� 0 executemenu executeMenu�� 
*���m+  ascr  ��ޭ